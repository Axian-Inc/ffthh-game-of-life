const formatTimeAgo = (timestamp) => {
  if (!timestamp) {
    return 'just now';
  }

  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return 'just now';
  }

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) {
    return 'just now';
  }

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) {
    return 'just now';
  }
  if (minutes < 60) {
    return `${minutes} minutes ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 2) {
    return 'about 1 hour ago';
  }
  if (hours < 24) {
    return `about ${hours} hours ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} days ago`;
  }

  const weeks = Math.floor(days / 7);
  if (weeks < 4) {
    return `${weeks} weeks ago`;
  }

  const months = Math.floor(days / 30);
  return `${months} months ago`;
};

export default formatTimeAgo;
