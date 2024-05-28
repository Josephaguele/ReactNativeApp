import { Account, Avatars, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';

export const appwriteConfig = {
    endpoint: "https://cloud.appwrite.io/v1",
    platform: "com.jsm.aora",
    projectId: "663f4d160030b7a3aff9",
    databaseId: "663f5109000a56a61182",
    userCollectionId: "663f514f002dc5af99cb",
    videoCollectionId: "663f5170002e8e58d1f7",
    storageId: "663f52e00013cb206716"
}

const {endpoint,platform,databaseId,projectId,userCollectionId,videoCollectionId,storageId} = appwriteConfig;    
// Init your React Native SDK
const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint) // Your Appwrite Endpoint
    .setProject(appwriteConfig.projectId) // Your project ID
    .setPlatform(appwriteConfig.platform) // Your application ID or bundle ID.
    ;


const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);
export const createUser = async (email, password, username) => {
    try {
        const newAccount = await account.create(ID.unique(), email, password, username);
        if (!newAccount) throw new Error("Failed to create user");
        const avatarUrl = avatars.getInitials(username);
        await signIn(email, password)
        const newUser = await databases.createDocument(databaseId, videoCollectionId, ID.unique(),
            {
                accountId: newAccount.$id,
                email,
                username,
                avatar: avatarUrl
            })
        return newUser;

    } catch (e) {
        console.log(e);
        throw new Error(e)
    }
}

export const signIn = async (email, password) => {
    try {
        // Check for any existing active sessions before creating a new one to resolve the error.
        let session = {};
        session  = await account.get();
        if(session){
            return session;
        } else {
            session = await account.createEmailPasswordSession(email, password);
            return session;
        }    
    } catch (e) {
        console.log(e, "JOSEPH");
        throw new Error(e)
    }

}

// Get Account
export async function getAccount() {
    try {
      const currentAccount = await account.get();
  
      return currentAccount;
    } catch (error) {
      throw new Error(error);
    }
  }

export const getCurrentUser = async () => {
    try {
        const currentAccount = await getAccount();
        console.log(currentAccount, "JOSEPH Test")
        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.userCollectionId);
        if (!currentUser) throw Error;
        console.log(currentUser, "JOSEPH Test 2")
        // this is because we only need one user.
        return currentUser.documents[0];
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const getAllPosts = async () => {
    try{
        const posts = await databases.listDocuments(databaseId, videoCollectionId);
        return posts.documents;
    }catch(e){
       

    }
}

export const getLatestPosts = async () => {
    try{
        const posts = await databases.listDocuments(databaseId, videoCollectionId, [Query.orderDesc('$createdAt', Query.limit(7))]);
        return posts.documents;
    }catch(e){
       throw new Error(e);
    }
}

export const searchPosts = async (query) => {
    try{
        const posts = await databases.listDocuments(databaseId, videoCollectionId, [Query.search('title', query)]);
        return posts.documents;
    }catch(e){
       throw new Error(e);
    }
}

export const getUserPosts = async (userId) => {
    try{
        const posts = await databases.listDocuments(databaseId, videoCollectionId, [Query.equal('creator', userId)]);
        return posts.documents;
    }catch(e){
       throw new Error(e);
    }
}

// Sign Out
export async function signOut() {
    try {
      const session = await account.deleteSession("current");
  
      return session;
    } catch (error) {
      throw new Error(error);
    }
  }

// Upload File
export async function uploadFile(file, type) {
    if (!file) return;
  
    const { mimeType, ...rest } = file;
    const asset = { type: mimeType, ...rest };
  
    try {
      const uploadedFile = await storage.createFile(
        appwriteConfig.storageId,
        ID.unique(),
        asset
      );
  
      const fileUrl = await getFilePreview(uploadedFile.$id, type);
      return fileUrl;
    } catch (error) {
      throw new Error(error);
    }
  }
  
  // Get File Preview
  export async function getFilePreview(fileId, type) {
    let fileUrl;
  
    try {
      if (type === "video") {
        fileUrl = storage.getFileView(appwriteConfig.storageId, fileId);
      } else if (type === "image") {
        fileUrl = storage.getFilePreview(
          appwriteConfig.storageId,
          fileId,
          2000,
          2000,
          "top",
          100
        );
      } else {
        throw new Error("Invalid file type");
      }
  
      if (!fileUrl) throw Error;
  
      return fileUrl;
    } catch (error) {
      throw new Error(error);
    }
  }
  
  // Create Video Post
  export async function createVideoPost(form) {
    try {
      const [thumbnailUrl, videoUrl] = await Promise.all([
        uploadFile(form.thumbnail, "image"),
        uploadFile(form.video, "video"),
      ]);
  
      const newPost = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.videoCollectionId,
        ID.unique(),
        {
          title: form.title,
          thumbnail: thumbnailUrl,
          video: videoUrl,
          prompt: form.prompt,
          creator: form.userId,
        }
      );
  
      return newPost;
    } catch (error) {
      throw new Error(error);
    }
  }
  