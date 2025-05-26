// frontend/app/src/pages/CreateCampaignPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CreateCampaignPage() {
  const [campaignName, setCampaignName] = useState('');
  const [worldId, setWorldId] = useState('');
  const [suiteVersion] = useState('1.0.0'); // Or fetch/determine dynamically if needed
  const [plotArcTitle, setPlotArcTitle] = useState('');
  const [plotOverview, setPlotOverview] = useState('');
  // Add other campaign fields as state if you want them in the form:
  // const [campaignScope, setCampaignScope] = useState('');
  // const [dmIntro, setDmIntro] = useState('');

  const [worlds, setWorlds] = useState([]);
  const [loadingWorlds, setLoadingWorlds] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:1001/api';

  useEffect(() => {
    axios.get(`${API_BASE_URL}/worlds`)
      .then(response => {
        setWorlds(response.data);
        setLoadingWorlds(false);
      })
      .catch(err => {
        console.error("Error fetching worlds:", err);
        setError('Failed to load worlds for selection.');
        setLoadingWorlds(false);
      });
  }, [API_BASE_URL]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!campaignName.trim()) {
      setError('Campaign name cannot be empty.');
      setSubmitting(false);
      return;
    }
    if (!worldId) {
      setError('Please select a world for the campaign.');
      setSubmitting(false);
      return;
    }

    const campaignData = {
      campaign_name: campaignName,
      world_id: parseInt(worldId, 10),
      suite_version_at_creation: suiteVersion,
      plot_arc_title: plotArcTitle,
      plot_overview: plotOverview,
      // Add other campaign fields to this object
      // campaign_scope: campaignScope,
      // dm_intro: dmIntro,
    };

    try {
      // The new backend endpoint for creating campaigns
      await axios.post(`${API_BASE_URL}/campaigns`, campaignData);
      navigate('/campaigns'); // Navigate to the new campaigns list page
    } catch (err) {
      console.error("Error creating campaign:", err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError(`Failed to create campaign. Check connection to ${API_BASE_URL}. (${err.message})`);
      }
      setSubmitting(false);
    }
  };

  if (loadingWorlds) return <p>Loading world data...</p>;

  return (
    <div>
      <h2>Create New Campaign</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="campaignName">Campaign Name:</label>
          <input
            type="text"
            id="campaignName"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            required
            disabled={submitting}
          />
        </div>

        <div>
          <label htmlFor="worldId">Select World:</label>
          <select
            id="worldId"
            value={worldId}
            onChange={(e) => setWorldId(e.target.value)}
            required
            disabled={submitting || worlds.length === 0}
          >
            <option value="">-- Select a World --</option>
            {worlds.map(world => (
              <option key={world.world_id} value={world.world_id}>
                {world.name} (ID: {world.world_id})
              </option>
            ))}
          </select>
          {worlds.length === 0 && !loadingWorlds && <p>No worlds available. Please create a world first.</p>}
        </div>
        
        <div>
          <label htmlFor="plotArcTitle">Plot Arc Title (Optional):</label>
          <input
            type="text"
            id="plotArcTitle"
            value={plotArcTitle}
            onChange={(e) => setPlotArcTitle(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div>
          <label htmlFor="plotOverview">Plot Overview (Optional):</label>
          <textarea
            id="plotOverview"
            value={plotOverview}
            onChange={(e) => setPlotOverview(e.target.value)}
            disabled={submitting}
            rows={3}
          />
        </div>
        
        {/* Add other optional campaign fields here, e.g.:
        <div>
          <label htmlFor="campaignScope">Campaign Scope:</label>
          <input type="text" id="campaignScope" value={campaignScope} onChange={(e) => setCampaignScope(e.target.value)} disabled={submitting} />
        </div>
        */}

        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={submitting || (worlds.length === 0 && !loadingWorlds) }>
          {submitting ? 'Creating...' : 'Create Campaign'}
        </button>
        <button type="button" className="cancel-button" onClick={() => navigate('/campaigns')} disabled={submitting}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default CreateCampaignPage;