import React, { useState, useEffect, useCallback, FC } from 'react';

interface RSSFeed {
  url: string;
  category: string;
}

interface Post {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  category: string;
  engagement: number;
}

interface RSSItem {
  guid?: string;
  link: string;
  title: string;
  pubDate: string;
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  autoRotate: boolean;
  setAutoRotate: (value: boolean) => void;
  rssFeeds: RssFeed[];
  setRssFeeds: React.Dispatch<React.SetStateAction<RssFeed[]>>;
  onPostsUpdate: (posts: Post[]) => void;
  onFeedsUpdate: () => void;
}

const SettingsPanel: FC<SettingsPanelProps> = ({ 
  isOpen, 
  onClose, 
  autoRotate, 
  setAutoRotate, 
  onPostsUpdate 
}) => {
  const [rssFeeds, setRssFeeds] = useState<RSSFeed[]>([
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', category: 'Technology' },
    { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', category: 'Business' },
    { url: 'https://www.sciencedaily.com/rss/top.xml', category: 'Science' },
    { url: 'https://www.who.int/rss-feeds/news-english.xml', category: 'Health' },
  ]);
  const [newFeedUrl, setNewFeedUrl] = useState<string>('');
  const [newFeedCategory, setNewFeedCategory] = useState<string>('');

  const fetchRSSFeed = async (feed: RSSFeed): Promise<Post[]> => {
    try {
      const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
      const data = await response.json();
      if (data.status !== 'ok' || !Array.isArray(data.items)) {
        console.error('Invalid RSS feed data:', data);
        return [];
      }
      return data.items.map((item: RSSItem) => ({
        id: item.guid || item.link,
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        category: feed.category,
        engagement: Math.floor(Math.random() * 100)
      }));
    } catch (error) {
      console.error('Error fetching RSS feed:', error);
      return [];
    }
  };

  const fetchAllFeeds = useCallback(() => {
    console.log("Fetching all feeds");
    Promise.all(rssFeeds.map(fetchRSSFeed))
      .then((allPosts) => {
        const newPosts = allPosts.flat();
        console.log("Total posts fetched: " + newPosts.length);
        onPostsUpdate(newPosts);  // Call the prop function here
      });
  }, [rssFeeds, onPostsUpdate]);

  useEffect(() => {
    fetchAllFeeds();
    const interval = setInterval(fetchAllFeeds, 60000);
    return () => clearInterval(interval);
  }, [fetchAllFeeds]);

  const addNewFeed = () => {
    if (newFeedUrl && newFeedCategory) {
      setRssFeeds([...rssFeeds, { url: newFeedUrl, category: newFeedCategory }]);
      setNewFeedUrl('');
      setNewFeedCategory('');
      fetchAllFeeds();
    }
  };

  const removeFeed = (index: number) => {
    const updatedFeeds = rssFeeds.filter((_, i) => i !== index);
    setRssFeeds(updatedFeeds);
    fetchAllFeeds();
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