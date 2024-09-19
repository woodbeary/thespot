import React from 'react';

interface PostEntryProps {
  onBack: () => void;
}

const PostEntry: React.FC<PostEntryProps> = ({ onBack }) => {
  return (
    <div>
      <h2>Post Entry</h2>
      <button onClick={onBack}>Back</button>
      {/* Add your post entry form or content here */}
    </div>
  );
};

export default PostEntry;