import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState, SearchInput, VideoCard } from "../../components";
import axios from 'axios';
import { useGlobalContext } from "../../context/GlobalProvider";

const Search = () => {
    const { query } = useLocalSearchParams();
    const [posts, setPosts] = useState([]);

    const { user } = useGlobalContext();

    const searchPosts = async () => {
        try {
            const response = await axios.get('http://192.168.1.6:5000/search-videos', {
                params: {
                    userId: user._id,
                    searchQuery: query
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
        searchPosts()
    }, [query]);

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
                ListHeaderComponent={() => (
                    <>
                        <View className="flex my-6 px-4">
                            <Text className="font-pmedium text-gray-100 text-sm">
                                Search Results
                            </Text>
                            <Text className="text-2xl font-psemibold text-white mt-1">
                                {query}
                            </Text>

                            <View className="mt-6 mb-8">
                                <SearchInput initialQuery={query} refetch={searchPosts} />
                            </View>
                        </View>
                    </>
                )}
                ListEmptyComponent={() => (
                    <EmptyState
                        title="No Videos Found"
                        subtitle="No videos found for this search query"
                    />
                )}
            />
        </SafeAreaView>
    );
};

export default Search;