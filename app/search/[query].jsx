import { FlatList, Text, View } from "react-native";
import useAppwrite from "../../lib/useAppwrite";
import { searchPosts } from "../../lib/appwrite";
import EmptyState from "../../components/EmptyState";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";
import VideoCard from "../../components/VideoCard";
import { useLocalSearchParams } from "expo-router";
import SearchInput from "../../components/SearchInput";

const Search = () => {
  const { data: posts, refetch } = useAppwrite(() => searchPosts(query));
  const { query } = useLocalSearchParams();

  useEffect(() => {
    refetch();
  }, [query]);

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <VideoCard
            title={item.title}
            thumbnail={item.thumbnail}
            video={item.video}
            creator={item.creator.username}
            avatar={item.creator.avatar}
          />
        )}
        ListHeaderComponent={() => (
          <View className="flex my-6 px-4">
            <Text className="font-pmedium text-sm text-gray-100">
              Search Results
            </Text>
            <Text className="text-2xl font-psemibold text-white mt-1">
              {query}
            </Text>
            <View className="mt-6 mb-8">
              <SearchInput initialQuery={query} refetch={refetch} />
            </View>
          </View>
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
