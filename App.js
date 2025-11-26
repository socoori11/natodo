import React, { useState, useRef, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Platform,
  FlatList,
  Pressable,
  Image,
  Animated,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import * as ImagePicker from 'expo-image-picker'

export default function App() {
  const [text, setText] = useState('')
  const [todos, setTodos] = useState([])
  const [date, setDate] = useState(new Date())
  const [showPicker, setShowPicker] = useState(false)
  const [photo, setPhoto] = useState(null)
  const [editingId, setEditingId] = useState(null)

  // 수정 모드 애니메이션
  const editAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (editingId) {
      editAnim.setValue(0)
      Animated.sequence([
        Animated.timing(editAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(editAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [editingId])

  const editScale = editAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  })

  const formatDate = (d) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const startEdit = (todo) => {
    setText(todo.title)
    setPhoto(todo.photo || null)
    setEditingId(todo.id)
  }

  const addTodo = () => {
    if (!text.trim()) return

    // 수정 모드
    if (editingId) {
      const updated = todos.map((item) => {
        if (item.id === editingId) {
          return {
            ...item,
            title: text.trim(),
            photo: photo,
          }
        }
        return item
      })
      setTodos(updated)
      setEditingId(null)
      setText('')
      setPhoto(null)
      return
    }

    // 추가 모드
    const newTodo = {
      id: Date.now().toString(),
      title: text.trim(),
      date: formatDate(date),
      photo,
    }
    setTodos([newTodo, ...todos])
    setText('')
    setPhoto(null)
  }

  const removeTodo = (id) => {
    setTodos(todos.filter((item) => item.id !== id))

    if (editingId === id) {
      setEditingId(null)
      setText('')
      setPhoto(null)
    }
  }

  const changeDate = (e, chdate) => {
    if (Platform.OS === 'android') {
      setShowPicker(false)
    }
    if (chdate) {
      setDate(chdate)
    }
  }

  const getPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      alert('카메라 권한을 설정해주세요')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    })

    if (result.canceled) return

    const uri = result.assets[0].uri
    setPhoto(uri)
  }

  const getGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      alert('갤러리 권한을 설정해주세요')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
    })

    if (result.canceled) return

    const uri = result.assets[0].uri
    setPhoto(uri)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo List</Text>

      <Text style={styles.modeText}>
        {editingId ? '✏️ 수정 모드 (항목 편집 중)' : '➕ 추가 모드'}
      </Text>

      {/* 입력 영역 카드 */}
      <Animated.View
        style={[
          styles.inputCard,
          editingId && styles.editingBox,
          editingId && { transform: [{ scale: editScale }] },
        ]}
      >
        {/* 1줄: 텍스트 입력 */}
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="할일 입력"
            value={text}
            onChangeText={setText}
          />
        </View>

        {/* 2줄: 날짜 + 추가/수정 버튼 */}
        <View style={styles.row}>
          <Pressable onPress={() => setShowPicker(true)} style={styles.dateButton}>
            <Text style={styles.dateText}>{formatDate(date)}</Text>
          </Pressable>

          <Pressable style={styles.addbtn} onPress={addTodo}>
            <Text style={styles.addtext}>
              {editingId ? '수정완료' : '추가'}
            </Text>
          </Pressable>
        </View>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={changeDate}
          />
        )}

        {/* 3줄: 사진 관련 버튼 */}
        <View style={styles.row}>
          <Pressable onPress={getPhoto} style={styles.smallButton}>
            <Text style={styles.smallButtonText}>📷 사진 찍기</Text>
          </Pressable>
          <Pressable onPress={getGallery} style={styles.smallButton}>
            <Text style={styles.smallButtonText}>🖼 갤러리</Text>
          </Pressable>
        </View>

        {/* 4줄: 사진 미리보기 */}
        <View style={styles.previewBox}>
          {photo && (
            <Image source={{ uri: photo }} style={styles.photoImage} />
          )}
        </View>
      </Animated.View>

      {/* 리스트 */}
      <FlatList
        style={styles.list}
        contentContainerStyle={todos.length === 0 && { flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
        data={todos}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>할일이 없어요</Text>}
        renderItem={({ item, index }) => (
          <Pressable
            onLongPress={() => removeTodo(item.id)}
            style={[
              styles.todoItem,
              editingId === item.id && styles.editingItem,
            ]}
          >
            <View style={styles.todoImageBox}>
              {item.photo && (
                <Image
                  source={{ uri: item.photo }}
                  style={{ width: '100%', height: '100%' }}
                />
              )}
            </View>
            <Text>번호: {index}</Text>
            <Text>제목: {item.title}</Text>
            <Text>날짜: {item.date}</Text>
            <Text style={styles.helpText}>길게 눌러서 삭제</Text>

            <Pressable onPress={() => startEdit(item)} style={styles.editButton}>
              <Text style={styles.editButtonText}>수정</Text>
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16,
    backgroundColor: '#f8bbd0', // 연한 분홍
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    color: '#4a148c',
  },
  modeText: {
    textAlign: 'center',
    marginBottom: 8,
    color: 'white',
    fontWeight: 'bold',
  },
  inputCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    // 간단한 그림자 느낌
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  editingBox: {
    backgroundColor: 'rgba(255, 255, 0, 0.2)',
    borderWidth: 2,
    borderColor: 'gold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  dateButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'lightgray',
    backgroundColor: '#fafafa',
    marginRight: 8,
  },
  dateText: {
    fontSize: 14,
  },
  addbtn: {
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  addtext: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  smallButton: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#e1bee7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  smallButtonText: {
    fontSize: 13,
    color: '#4a148c',
    fontWeight: '600',
  },
  previewBox: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  list: {
    flex: 1,
  },
  todoItem: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  editingItem: {
    borderWidth: 2,
    borderColor: 'orange',
    backgroundColor: '#fff3e0',
  },
  todoImageBox: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 6,
    backgroundColor: '#f0f0f0',
  },
  helpText: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  editButton: {
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#ff9800',
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
  },
})
