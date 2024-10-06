import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Image, FlatList, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { icons } from "../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";
import { EmptyState, InfoBox, VideoCard } from "../../components";
import axios from 'axios';
import { useEffect, useState } from "react";

const Profile = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();
  const [posts, setPosts] = useState([]);

  const fetchVideos = async () => {
    try {
      const response = await axios.get('http://192.168.1.6:5000/user-videos', {
        params: {
          userId: user._id
        },
        headers: {
          'Content-Type': 'application/json',
        }
      });
      setPosts(response.data.posts)
    }
    catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  const logout = async () => {
    try {
      await axios.post('http://192.168.1.6:5000/logout', { userId: user._id }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      await AsyncStorage.removeItem('token');
      Alert.alert("Success", "User signed out successfully");
      setUser(null);
      setIsLogged(false);
      router.replace("/sign-in");
    }
    catch (error) {
      console.log(error)
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <VideoCard
            title={item.title}
            thumbnail={item.thumbnailUrl}
            video={item.videoUrl}
          // creator={item.creator.username}
          // avatar={item.creator.avatar}
          />
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="No videos found for this profile"
          />
        )}
        ListHeaderComponent={() => (
          <View className="w-full flex justify-center items-center mt-6 mb-12 px-4">
            <TouchableOpacity
              onPress={logout}
              className="flex w-full items-end mb-10"
            >
              <Image
                source={icons.logout}
                resizeMode="contain"
                className="w-6 h-6"
              />
            </TouchableOpacity>

            <View className="w-16 h-16 border border-blue-500 rounded-lg flex justify-center items-center">
              <Image
                source={{ uri: user?.avatar }}
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
              />
            </View>

            <InfoBox
              title={user?.username}
              containerStyles="mt-5"
              titleStyles="text-lg"
            />

            <View className="mt-5 flex flex-row">
              <InfoBox
                title={posts.length || 0}
                subtitle="Posts"
                titleStyles="text-xl"
                containerStyles="mr-10"
              />
              <InfoBox
                title="1.2k"
                subtitle="Followers"
                titleStyles="text-xl"
              />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default Profile;