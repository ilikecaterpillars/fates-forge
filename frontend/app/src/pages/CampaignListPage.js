// frontend/app/src/pages/CampaignListPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function CampaignListPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Construct API URL from environment variable
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:1001/api';

  useEffect(() => {
    axios.get(`${API_BASE_URL}/campaigns`) // Changed from /projects to /campaigns
      .then(response => {
        setCampaigns(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching campaigns:", err);
        setError(`Failed to load campaigns from ${API_BASE_URL}. (${err.message})`);
        setLoading(false);
      });
  }, [API_BASE_URL]);

  if (loading) return <p>Loading campaigns...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div>
      <h2>Campaigns</h2> {/* Changed from Projects */}
      <Link to="/create-campaign">Create New Campaign</Link> {/* Changed link */}
      {campaigns.length === 0 ? (
        <p>No campaigns found. Create one!</p>
      ) : (
        <ul>
          {campaigns.map(campaign => (
            <li key={campaign.campaign_id}> {/* Changed key to campaign_id */}
              <Link to={`/campaigns/${campaign.campaign_id}`}> {/* Changed link path */}
                {campaign.campaign_name}
              </Link>
              {/* Display world name if available, based on backend response for GET /api/campaigns */}
              {campaign.world_name && ` (World: ${campaign.world_name})`}
              {' '}(ID: {campaign.campaign_id}, Version: {campaign.suite_version_at_creation})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CampaignListPage;