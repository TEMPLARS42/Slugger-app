import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, Image, RefreshControl, Text, View } from "react-native";
import { images } from "../../constants";
import { EmptyState, SearchInput, VideoCard, Trending } from "../../components";
import { useGlobalContext } from "../../context/GlobalProvider";
import axios from 'axios';

const Home = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);  // Track the current page
  const [totalVideos, setTotalVideos] = useState(0);  // Track total videos available
  const [loadingMore, setLoadingMore] = useState(false);  // Track if more data is being loaded

  const { user } = useGlobalContext();

  const fetchVideos = async (page = 0) => {
    try {
      const response = await axios.get('http://192.168.1.6:5000/trending-videos', {
        params: {
          limit: 10,
          offset: page * 10,  // Calculate offset based on the page
        },
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const newPosts = response.data.posts;
      setTotalVideos(response.data.total);
      setPosts(prevPosts => page === 0 ? newPosts : [...prevPosts, ...newPosts]);
    }
    catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(0);
    await fetchVideos(0);
  };

  const loadMoreVideos = async () => {
    if (loadingMore || posts.length >= totalVideos) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchVideos(nextPage);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <SafeAreaView className="bg-primary">
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <VideoCard
            title={item.title}
            thumbnail={item.thumbnailUrl}
            video={item.videoUrl}
            videoId={item._id}
          // creator={item.creator.username}
          // avatar={item.creator.avatar}
          />
        )}
        ListHeaderComponent={() => (
          <View className="flex my-6 px-4 space-y-6">
            <View className="flex justify-between items-start flex-row mb-6">
              <View>
                <Text className="font-pmedium text-sm text-gray-100">
                  Welcome Back
                </Text>
                <Text className="text-2xl font-psemibold text-white">
                  {user?.userName}
                </Text>
              </View>

              <View className="mt-1.5">
                <Image
                  source={images.logo}
                  className="w-9 h-10"
                  resizeMode="contain"
                />
              </View>
            </View>

            <SearchInput />

            <View className="w-full flex-1 pt-5 pb-8">
              <Text className="text-lg font-pregular text-gray-100 mb-3">
                Latest Videos
              </Text>

              {/* <Trending posts={posts || []} /> */}
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="No videos created yet"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMoreVideos}
        onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  );
};

export default Home;
