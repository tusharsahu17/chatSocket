import React, {useEffect, useRef, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  Dimensions,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {THEME} from '../../utils/theme';
import {CheckCheck, Send} from 'lucide-react-native';
import moment from 'moment';
import {useSelector} from 'react-redux';
import {selectUser} from '../../features/auth/authSlice';
import {WS_URL} from '../../utils/constants';
import {getSingleUserChats} from '../../services/doctorApi';

const {width} = Dimensions.get('window');

const Chat = ({navigation, route}) => {
  const ws = React.useRef(new WebSocket(WS_URL)).current;

  const {id} = route.params;
  const {user} = useSelector(selectUser);
  // const user_id = 1;
  // console.log(id);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [oppUser, setOppUser] = useState(null);
  const [loader, setLoader] = useState(false);

  const fetchMessages = async () => {
    setLoader(true);
    const res = await getSingleUserChats(id);
    if (res.status) {
      const uData = {
        ...res,
        messages: [],
      };

      // console.log(JSON.stringify(res.messages, null, 2));

      setMessages(res.messages);

      navigation.setOptions({
        headerTitle: () => (
          <Text style={styles.name} numberOfLines={1}>
            {uData?.name}
          </Text>
        ),
      });

      setOppUser(uData);
    } else {
      setMessages([]);
      setOppUser(null);
    }
    setLoader(false);
  };

  const handleSendMessage = async () => {
    if (message) {
      // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      const messageText = {
        message: message,
        sender_id: user.user.id,
        receiver_id: id,
      };
      // console.log(messageText);
      try {
        ws.send(JSON.stringify(messageText));
      } catch (error) {
        console.log('error', error);
      }
      setMessage('');
      //   setMessages([newMessage, ...messages]);
      //   setMessage('');
    }
  };

  const renderItem = ({item}) => {
    const isMy = item.sender_id === user.user.id;
    return (
      <View
        style={{
          backgroundColor: isMy ? THEME.THEME_COLOUR : THEME.COLOR_WHITE,
          marginVertical: 10,
          padding: 10,
          maxWidth: width - 100,
          alignSelf: isMy ? 'flex-end' : 'flex-start',
          borderRadius: 25,
          borderBottomRightRadius: isMy ? 0 : 25,
          borderBottomLeftRadius: isMy ? 25 : 0,
          paddingHorizontal: 12,
        }}>
        <Text
          style={{
            color: isMy ? THEME.COLOR_WHITE : THEME.COLOR_GRAY,
          }}>
          {item.message}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: isMy ? 'flex-end' : 'flex-start',
            alignItems: 'flex-end',
            gap: 5,
          }}>
          {isMy && item.read ? (
            <CheckCheck color={THEME.COLOR_WHITE} size={16} />
          ) : null}
          <Text
            style={[
              styles.time,
              {
                textAlign: isMy ? 'right' : 'left',
                color: isMy ? THEME.COLOR_WHITE : THEME.COLOR_GRAY,
              },
            ]}>
            {moment(
              item?.time || item?.datetime,
              'DD/MM/YY HH:mm:ss',
              true,
            ).isValid()
              ? moment(item?.time || item?.datetime, 'DD/MM/YY').fromNow()
              : moment(item?.time || item?.datetime).fromNow()}
          </Text>
        </View>
      </View>
    );
  };

  useEffect(() => {
    // const serverMessagesList = [];
    // ws.onopen = () => {};
    ws.onmessage = e => {
      fetchMessages();
      // const aMessages = JSON.parse(e.data);
      // serverMessagesList.push(aMessages);
      // const allChats = [...serverMessagesList].flat(1).reverse();

      // const fData = allChats.filter(item => {
      //   return (
      //     (item.sender_id === id || item.receiver_id === id) &&
      //     (item.sender_id === user.user.id || item.receiver_id === user.user.id)
      //   );
      // });

      // console.log(JSON.stringify(fData, null, 2));

      // setMessages(fData);
    };
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        inverted={true}
        style={styles.list}
        contentContainerStyle={{paddingHorizontal: 10}}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        // onContentSizeChange={(width, height) => {
        //   scrollViewSizeChanged(height);
        // }}
      />
      {loader && (
        <View style={styles.loader}>
          <ActivityIndicator color={THEME.THEME_COLOUR} size="large" />
        </View>
      )}
      <View
        style={{
          borderWidth: 1,
          borderColor: THEME.COLOR_GRAY,
          borderRadius: 5,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 10,
          marginHorizontal: 10,
          overflow: 'hidden',
          margin: 10,
        }}>
        <TextInput
          value={message}
          onChangeText={msg => setMessage(msg)}
          blurOnSubmit={false}
          onSubmitEditing={handleSendMessage}
          placeholder="Type a message"
          returnKeyType="send"
          style={{
            flex: 1,
            color: THEME.COLOR_BLACK,
          }}
        />
        <Pressable onPress={handleSendMessage}>
          <Send color={THEME.THEME_COLOUR} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.BACKGROUND_COLOR_LIGHT,
  },
  keyboard: {
    flex: 1,
  },
  time: {
    fontSize: 10,
    marginTop: 10,
  },
  name: {
    color: THEME.COLOR_WHITE,
    fontWeight: 'bold',
    fontSize: 21,
    textTransform: 'capitalize',
  },
  loader: {
    ...THEME.LOADER,
  },
});
export default Chat;
