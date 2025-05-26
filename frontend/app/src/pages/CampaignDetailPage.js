// frontend/app/src/pages/CampaignDetailPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

function CampaignDetailPage() {
  const { campaignId } = useParams(); // Changed from projectId
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:1001/api';

  useEffect(() => {
    if (campaignId) {
      axios.get(`${API_BASE_URL}/campaigns/${campaignId}`) // Changed endpoint
        .then(response => {
          setCampaign(response.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(`Error fetching campaign ${campaignId}:`, err);
          setError(`Failed to load campaign details. (${err.message})`);
          setLoading(false);
        });
    }
  }, [campaignId, API_BASE_URL]);

  if (loading) return <p>Loading campaign details...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!campaign) return <p>Campaign not found.</p>;

  // Helper to display JSONB data or N/A
  const displayJsonData = (data, field) => {
    if (data && data[field]) {
      if (typeof data[field] === 'object') {
        return <pre>{JSON.stringify(data[field], null, 2)}</pre>;
      }
      return data[field];
    }
    return 'N/A';
  };
  
  const displaySimpleField = (data, field, defaultValue = 'N/A') => {
    return data && data[field] ? data[field] : defaultValue;
  };


  return (
    <div>
      <h2>Campaign: {campaign.campaign_name}</h2>
      <p><strong>Suite Version at Creation:</strong> {campaign.suite_version_at_creation}</p>
      <p><strong>Created:</strong> {new Date(campaign.created_date).toLocaleString()}</p>
      <p><strong>Last Saved:</strong> {new Date(campaign.last_saved_date).toLocaleString()}</p>
      
      <hr style={{borderColor: '#4a4f58', margin: '20px 0'}} />

      <h3>Linked World</h3>
      <p><strong>World Name:</strong> {displaySimpleField(campaign, 'world_name')}</p>
      <p><strong>World Core Concept:</strong> {displaySimpleField(campaign, 'world_core_concept')}</p>

      <hr style={{borderColor: '#4a4f58', margin: '20px 0'}} />
      
      <h3>Campaign Plot</h3>
      <p><strong>Plot Arc Title:</strong> {displaySimpleField(campaign, 'plot_arc_title')}</p>
      <p><strong>Plot Overview:</strong> {displaySimpleField(campaign, 'plot_overview')}</p>
      <p><strong>Main Questline:</strong></p>
      <div>{displayJsonData(campaign, 'main_questline')}</div>
      <p><strong>Side Quests:</strong></p>
      <div>{displayJsonData(campaign, 'side_quests')}</div>
      <p><strong>DM Intro:</strong> {displaySimpleField(campaign, 'dm_intro')}</p>
      {/* Consider security before displaying dm_secrets widely */}
      {/* <p><strong>DM Secrets:</strong> {displaySimpleField(campaign, 'dm_secrets')}</p> */}


      {/* Reusing world_campaign_data structure from old ProjectDetailPage if backend now populates campaign fields similarly */}
      {/* This section may need adjustment based on the exact structure of campaign object from the new API */}
      <h3>Legacy World & Campaign Data (if applicable)</h3>
      {campaign.world_campaign_data ? ( /* This was from old project structure, adapt if needed */
        <>
          <p><strong>Core Concept (Legacy):</strong> {campaign.world_campaign_data.core_concept || 'N/A'}</p>
          <p><strong>Themes (Legacy):</strong> {campaign.world_campaign_data.themes || 'N/A'}</p>
          <p><strong>Generation Mode (Legacy):</strong> {campaign.world_campaign_data.generation_mode || 'N/A'}</p>
        </>
      ) : (
        // Check new direct campaign fields for this info if the above is no longer populated
        <p>No legacy world and campaign data block found for this campaign. Check main plot section.</p>
      )}

      <hr style={{borderColor: '#4a4f58', margin: '20px 0'}} />

      <h3>Player Characters ({campaign.player_characters ? campaign.player_characters.length : 0})</h3>
      {campaign.player_characters && campaign.player_characters.length > 0 ? (
        <ul>
          {campaign.player_characters.map(pc => (
            <li key={pc.player_character_id}>{pc.character_name} - Level {pc.level}</li>
            // TODO: Add link to view/edit character details
          ))}
        </ul>
      ) : (
        <p>No player characters created for this campaign yet.</p>
      )}

      <hr style={{borderColor: '#4a4f58', margin: '20px 0'}} />
      
      <h3>Live Session State</h3>
       {campaign.live_session_state ? (
        <>
          <p><strong>Narrative Focus:</strong> {campaign.live_session_state.narrative_focus || 'N/A'}</p>
          <p><strong>In-Game Date:</strong> {campaign.live_session_state.current_ingame_datetime || 'N/A'}</p>
        </>
      ) : (
        <p>No live session data found for this campaign.</p>
      )}

      <hr style={{borderColor: '#4a4f58', margin: '20px 0'}} />

      <h3>NPC Instances in this Campaign ({campaign.campaign_npc_instances ? campaign.campaign_npc_instances.length : 0})</h3>
      {campaign.campaign_npc_instances && campaign.campaign_npc_instances.length > 0 ? (
        <ul>
          {campaign.campaign_npc_instances.map(npc => (
            <li key={npc.campaign_npc_instance_id}>
              <strong>{npc.custom_name || npc.npc_template_name}</strong>
              {npc.location_name && ` (at ${npc.location_name})`}
              <br />
              HP: {npc.current_hp !== null && npc.current_hp !== undefined ? npc.current_hp : 'N/A'}
              {npc.current_state && <><br/>State: <pre>{JSON.stringify(npc.current_state, null, 2)}</pre></>}
            </li>
          ))}
        </ul>
      ) : (
        <p>No NPC instances defined for this campaign yet.</p>
      )}
      
      <hr style={{borderColor: '#4a4f58', margin: '20px 0'}} />

       <h3>Item Instances in this Campaign ({campaign.campaign_item_instances ? campaign.campaign_item_instances.length : 0})</h3>
      {campaign.campaign_item_instances && campaign.campaign_item_instances.length > 0 ? (
        <ul>
          {campaign.campaign_item_instances.map(item => (
            <li key={item.campaign_item_instance_id}>
              <strong>{item.item_template_name}</strong> (x{item.quantity})
              {item.location_name && ` (at ${item.location_name})`}
              <br />
              Type: {item.item_type}
              {item.instance_properties && <><br/>Properties: <pre>{JSON.stringify(item.instance_properties, null, 2)}</pre></>}
            </li>
          ))}
        </ul>
      ) : (
        <p>No item instances placed in this campaign's locations yet.</p>
      )}

      <hr style={{borderColor: '#4a4f58', margin: '20px 0'}} />
      <Link to="/campaigns">Back to Campaign List</Link> {/* Changed link */}
      
      <div style={{marginTop: '20px', border: '1px solid #4a4f58', padding: '10px', borderRadius: '4px'}}>
        <h4>Operate on this Campaign:</h4>
        <button>World & Campaign Design</button> {/* This button's functionality will need to be defined */}
        <Link to={`/campaigns/${campaign.campaign_id}/create-character`}> {/* Changed link */}
          <button>Create New Character</button>
        </Link>
        <button>Run Adventure Session</button> {/* This button's functionality will need to be defined */}
      </div>
    </div>
  );
}

export default CampaignDetailPage;