import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {THEME} from '../../utils/theme';
import {Avatar} from '@rneui/themed';
import moment from 'moment';
import {ROUTES} from '../../navigation/routes';
import {getAllChats} from '../../services/doctorApi';
import NoData from '../../components/NoData';
import {useIsFocused} from '@react-navigation/native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {WS_URL} from '../../utils/constants';

const Tab = createMaterialTopTabNavigator();

const Chats = ({navigation}) => {
  const ws = React.useRef(new WebSocket(WS_URL)).current;
  const isFocused = useIsFocused();

  const [loader, setLoader] = useState(false);
  const [allChats, setAllChats] = useState([]);

  // unread_messages
  const renderItem = item => {
    const Message = item.item;
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate(ROUTES.chat, {id: Message.id})}>
        <View style={styles.container}>
          {/* <Image style={styles.image} source={{uri: Message.image}} /> */}
          <Avatar
            size={45}
            rounded
            title={
              Message?.image ? '' : Message?.name?.slice(0, 2)?.toUpperCase()
            }
            // source={Message?.image ? {uri: getImageUrl(Message?.image)} : null}
            source={Message?.image ? {uri: Message?.image} : null}
            containerStyle={{
              backgroundColor: THEME.THEME_COLOUR,
              marginLeft: 10,
            }}
          />
          <View style={styles.content}>
            <View style={styles.contentHeader}>
              <Text style={styles.name}>{Message.name}</Text>
              <Text style={styles.time}>
                {moment(Message.datetime).fromNow()}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                gap: 6,
                alignItems: 'space-between',
                // justifyContent: 'space-between',
              }}>
              {/* {Message.type === 'out' && Message.userStatus === 'read' ? (
                <CheckCheck color={THEME.THEME_COLOUR} size={16} />
              ) : null}
              {Message.type === 'out' && Message.userStatus === 'unread' ? (
                <Check color={THEME.THEME_COLOUR} size={16} />
              ) : null} */}
              <Text
                style={{
                  marginRight: 10,
                  // THEME.COLOR_GRAY,
                  color:
                    Message.unread_messages > 0
                      ? THEME.COLOR_BLACK
                      : THEME.COLOR_GRAY,
                  fontWeight:
                    Message.unread_messages > 0
                      ? THEME.FONT_WEIGHT_BOLD
                      : THEME.FONT_WEIGHT_LIGHT,
                }}
                numberOfLines={1}>
                {Message.message}
              </Text>
              {Message.unread_messages > 0 && (
                <Text
                  style={{
                    paddingRight: 10,
                    fontWeight: THEME.FONT_WEIGHT_BOLD,
                    color: THEME.COLOR_BLACK,
                  }}>
                  ({Message.unread_messages})
                </Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const fetchAllChats = async () => {
    setLoader(true);
    const res = await getAllChats();
    // console.log(JSON.stringify(res.data, null, 2));
    if (res.status) {
      setAllChats(res.data);
    } else {
      setAllChats([]);
    }
    setLoader(false);
  };

  useEffect(() => {
    fetchAllChats();
  }, [isFocused]);

  useEffect(() => {
    ws.onopen = () => {
      console.log('connected');
    };
    ws.onmessage = e => {
      fetchAllChats();
    };
  }, []);

  const TabList = ({route}) => {
    const type = route.params?.type || '';

    return (
      <SafeAreaView style={styles.rootContainer}>
        <FlatList
          style={styles.root}
          data={type ? allChats.filter(chats => chats.role === type) : allChats}
          refreshControl={
            <RefreshControl refreshing={loader} onRefresh={fetchAllChats} />
          }
          ItemSeparatorComponent={() => {
            return <View style={styles.separator} />;
          }}
          keyExtractor={item => {
            return item.id;
          }}
          renderItem={renderItem}
          ListEmptyComponent={<NoData msg={'No Chats Found!!'} />}
        />
        {loader && (
          <View style={styles.loader}>
            <ActivityIndicator color={THEME.THEME_COLOUR} size="large" />
          </View>
        )}
      </SafeAreaView>
    );
  };

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="All Chats"
        component={TabList}
        // initialParams={{
        //   type: '',
        // }}
      />
      <Tab.Screen
        name="Doctors Chats"
        component={TabList}
        initialParams={{
          type: 'doctor',
        }}
      />
      <Tab.Screen
        name="Patients Chats"
        component={TabList}
        initialParams={{
          type: 'patients',
        }}
      />
    </Tab.Navigator>
  );
};
const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: THEME.COLOR_WHITE,
  },
  root: {
    backgroundColor: THEME.COLOR_WHITE,
  },
  container: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  content: {
    marginLeft: 16,
    flex: 1,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  separator: {
    height: 1,
    backgroundColor: THEME.COLOR_GRAY_LIGHT,
  },
  image: {
    width: 45,
    height: 45,
    borderRadius: 22,
    marginLeft: 20,
  },
  time: {
    fontSize: 11,
    color: THEME.COLOR_GRAY,
    marginRight: 20,
  },
  name: {
    fontSize: 16,
    color: THEME.COLOR_BLACK,
    textTransform: 'capitalize',
  },
  loader: {
    ...THEME.LOADER,
  },
});
export default Chats;
