import { useState } from "react";
import { ResizeMode, Video } from "expo-av";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";

import { icons } from "../constants";
import { useGlobalContext } from "../context/GlobalProvider";
import axios from "axios";

const VideoCard = ({ title, creator, avatar, thumbnail, video, videoId }) => {
    const [play, setPlay] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const { user } = useGlobalContext();

    const saveBookmark = async () => {
        try {
            const response = await axios.post('http://192.168.1.6:5000/add-bookmark', {
                data: { videoId, userId: user._id },
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            Alert.alert(response.data.message);
            setShowDropdown(false);
        }
        catch (error) {
            console.log("Error saving bookmark:", error);
        }
    }

    return (
        <View className="flex flex-col items-center px-4 mb-14">
            <View className="flex flex-row gap-3 items-start relative">
                <View className="flex justify-center items-center flex-row flex-1">
                    <View className="w-[46px] h-[46px] rounded-lg border border-blue-500 flex justify-center items-center p-0.5">
                        <Image
                            source={{ uri: avatar }}
                            className="w-full h-full rounded-lg"
                            resizeMode="cover"
                        />
                    </View>

                    <View className="flex justify-center flex-1 ml-3 gap-y-1">
                        <Text
                            className="font-psemibold text-sm text-white"
                            numberOfLines={1}
                        >
                            {title}
                        </Text>
                        <Text
                            className="text-xs text-gray-100 font-pregular"
                            numberOfLines={1}
                        >
                            {creator}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    className="pt-2"
                    onPress={() => setShowDropdown(!showDropdown)}
                >
                    <Image
                        source={icons.menu}
                        className="w-5 h-5"
                        resizeMode="contain"
                    />
                </TouchableOpacity>

                {showDropdown && (
                    <View className="absolute top-8 right-0 bg-black p-3 rounded-md shadow-md z-10">
                        <TouchableOpacity
                            onPress={() => saveBookmark()}
                            className="mb-2"
                        >
                            <Text className="text-white text-sm">Add as Bookmark</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity
                            onPress={() => console.log('Option 2 pressed')}
                            className="mb-2"
                        >
                            <Text className="text-white text-sm">Option 2</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => console.log('Option 3 pressed')}>
                            <Text className="text-white text-sm">Option 3</Text>
                        </TouchableOpacity> */}
                    </View>
                )}
            </View>

            {play ? (
                <Video
                    source={{ uri: video }}
                    className="w-full h-60 rounded-xl mt-3"
                    resizeMode={ResizeMode.CONTAIN}
                    useNativeControls
                    shouldPlay
                    onPlaybackStatusUpdate={(status) => {
                        if (status.didJustFinish) {
                            setPlay(false);
                        }
                    }}
                />
            ) : (
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setPlay(true)}
                    className="w-full h-60 rounded-xl mt-3 relative flex justify-center items-center"
                >
                    <Image
                        source={{ uri: thumbnail }}
                        className="w-full h-full rounded-xl"
                        resizeMode="cover"
                    />

                    <Image
                        source={icons.play}
                        className="w-12 h-12 absolute"
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

export default VideoCard;
