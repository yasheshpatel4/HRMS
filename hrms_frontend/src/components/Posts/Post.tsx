import { useState } from 'react';
import PostForm from './PostForm';
import PostList from './PostList';


const Post = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePostCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };
  return(
    <>
      <PostForm onPostCreated={handlePostCreated}/>
     <PostList filter="all" refreshTrigger={refreshTrigger} />
    </> 
  );
   
};

export default Post;
