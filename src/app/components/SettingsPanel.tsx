import React, { useState, FC } from 'react';

interface RSSFeed {
  url: string;
  category: string;
}

/*
interface Post {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  category: string;
  engagement: number;
}*/

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  autoRotate: boolean;
  setAutoRotate: (value: boolean) => void;
  rssFeeds: RSSFeed[];
  setRssFeeds: React.Dispatch<React.SetStateAction<RSSFeed[]>>;
//  onPostsUpdate: (posts: Post[]) => void;
  onFeedsUpdate: () => void;
}

const SettingsPanel: FC<SettingsPanelProps> = ({ 
  isOpen, 
  onClose, 
  autoRotate, 
  setAutoRotate, 
  rssFeeds,
  setRssFeeds,
 // onPostsUpdate,
  onFeedsUpdate
}) => {
  const [newFeedUrl, setNewFeedUrl] = useState<string>('');
  const [newFeedCategory, setNewFeedCategory] = useState<string>('');

  const addNewFeed = () => {
    if (newFeedUrl && newFeedCategory) {
      setRssFeeds([...rssFeeds, { url: newFeedUrl, category: newFeedCategory }]);
      setNewFeedUrl('');
      setNewFeedCategory('');
      onFeedsUpdate();
    }
  };

  const removeFeed = (index: number) => {
    const updatedFeeds = rssFeeds.filter((_, i) => i !== index);
    setRssFeeds(updatedFeeds);
    onFeedsUpdate();
  };

  if (!isOpen) return null;

  return (
    <div className="sidebar" style={{
      position: 'fixed',
      right: 0,
      top: 0,
      bottom: 0,
      width: '300px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '20px',
      boxShadow: '-2px 0 5px rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      overflowY: 'auto',
    }}>
      <h2>Settings</h2>
      <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px' }}>Close</button>
      
      <div style={{ marginTop: '20px' }}>
        <label>
          <input
            type="checkbox"
            checked={autoRotate}
            onChange={(e) => setAutoRotate(e.target.checked)}
          />
          Auto Rotate
        </label>
      </div>

      <h3>RSS Feeds</h3>
      {rssFeeds.map((feed, index) => (
        <div key={index} style={{ marginBottom: '10px' }}>
          <div className="feed-item">{feed.url} ({feed.category})</div>
          <button onClick={() => removeFeed(index)}>Remove</button>
        </div>
      ))}

      <h4>Add New Feed</h4>
      <input
        type="text"
        value={newFeedUrl}
        onChange={(e) => setNewFeedUrl(e.target.value)}
        placeholder="Enter RSS feed URL"
        style={{ width: '100%', marginBottom: '5px' }}
      />
      <input
        type="text"
        value={newFeedCategory}
        onChange={(e) => setNewFeedCategory(e.target.value)}
        placeholder="Enter category"
        style={{ width: '100%', marginBottom: '5px' }}
      />
      <button onClick={addNewFeed}>Add Feed</button>
    </div>
  );
};

export default SettingsPanel;