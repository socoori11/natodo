import React, {useState} from 'react'
import { StyleSheet, Text, View, TextInput,
    Platform, FlatList, Pressable, Image,
 } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker'
import * as ImagePicker from 'expo-image-picker'
// 설치해야 함. npx expo install expo-image-picker

export default function App() {
  const [text, setText] = useState('')
  const [todos, setTodos] = useState([])
  const [date, setDate] = useState( new Date()) // 현재날짜 기초값 
  const [showPicker, setShowPicker] = useState(false) // 날짜피커보여주기
  const [photo, setPhoto] = useState(null) // 현재 선택/찍은 사진 uri

  // 날짜 형식 만들기
  const formatDate = (d) =>{
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}` // 날짜 형식 맞추어서 리턴
  }

  // 추가 버튼 구현
  const addTodo = () =>{
    if (!text.trim()) return

    const newTodo = {
      id : Date.now().toString(),
      title : text.trim(),
      date : formatDate(date),
      photo,
    }
    setTodos([newTodo, ...todos])
    setText('')
    setPhoto(null)
  }

  // 삭제 버튼 구현
  const removeTodo = (id)=>{
      setTodos( todos.filter( (item) => item.id !== id) )
  }

  // 날짜 변경시 이벤트 함수
  const changeDate = (e, chdate ) =>{
    if (Platform.OS === 'android' ){
      setShowPicker(false)
    }
    if (chdate) {
      setDate(chdate)
    }
  }

  // 카메라로 사진을 찍기
  const getPhoto = async ()=>{
     const { status } = await ImagePicker.requestCameraPermissionsAsync()
     if ( status !== 'granted'){
       alert("카메라 권한을 설정해주세요")
       return
     }

     const result = await ImagePicker.launchCameraAsync({
        allowsEditing:true,
        quality : 0.8,
     })

     if (result.canceled) return

     const uri = result.assets[0].uri
     setPhoto(uri)
   }

   // 갤러리에서 사진 선택
   const getGallery = async () =>{
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if ( status !== 'granted'){
       alert("갤러리 권한을 설정해주세요")
       return
     }

     const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing:true,
        quality : 0.8,
     })

     if (result.canceled) return

     const uri = result.assets[0].uri
     setPhoto(uri)
   }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo List</Text>
      <View style={styles.inputR}>

        {/* 할일 입력상자 */}
        <TextInput style={styles.in} placeholder='할일 입력'
          value={text}
          onChangeText={setText}
        />

        {/* 날짜 버튼 만들기*/}
        <Pressable onPress={ () => setShowPicker(true)}> 
          <Text>{formatDate(date)}</Text>
        </Pressable>
      { //  showpicker가 참(true)값이면 데이트피커를 호출해서 보여주기
          showPicker && (
            <DateTimePicker 
                value={date} 
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={changeDate}
            />
          )}

          {/* 사진 관련 버튼들 */}
          <View>
              <Pressable onPress={getPhoto}>
                <Text>사진찍~~~~~~~~~~~~~~기</Text>
              </Pressable>
              <Pressable onPress={getGallery}>
                <Text>갤러리</Text>
              </Pressable>
          </View>

          <View style={{width : 150, height : 100, }}>
            {
               photo && ( 
                <Image source={{ uri : photo }}  style={{width : '100%', height : '100%'}} />
               ) 
            }
          </View>


        {/* 추가버튼 만들기 */}
        <Pressable  style={styles.addbtn} onPress={addTodo}>
          <Text style={styles.addtext}>추가</Text>
        </Pressable>
      </View>




      {/* 할일 목록 리스트  */}
      <FlatList 
         data = {todos}
         keyExtractor={ (item) => item.id }
         ListEmptyComponent={
           <Text>할일이 없어요</Text>
         }
         renderItem={ ({item, idx}) => (
            <Pressable onLongPress={ () => removeTodo(item.id)} >
              <View style={{ width:100, height:100}}>
                 <Image source={{ uri : item.photo}} style={{ width:'100%', height:'100%'}} />
              </View>
               <Text>{idx}</Text>
               <Text>{item.title}</Text>
               <Text>{item.date}</Text>
               <Text> 길게 눌러서 삭제</Text>
            </Pressable>
         )} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop : 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'pink',
  },
  title : {
    fontSize : 30,
    marginBottom : 20,
  },
  inputR : {
    flexDirection : 'row',
    marginBottom : 20,
  },

  in : {
    width : 80,
    height : 40,
    borderWidth : 1,
    borderColor : "lightGray",
    padding : 12,
    borderRadius : 10,
    marginRight : 10,
  },

  addbtn : {
    width : 80,
    height : 40,
    backgroundColor : "green",
    color : "white",
    justifyContent : 'center',
    alignItems : 'center',
    borderRadius : 7,
  },

  addtext : {
    fontSize : 20,
    color : 'white',
  },
  previewBox : {
    width: 120,
    height :80,
    borderRadius :10,
  }, 
  photoImage : {
    width: '100%',
    height :'100%',
  }
});
