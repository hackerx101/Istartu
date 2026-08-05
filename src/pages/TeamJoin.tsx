import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Users, Search, Plus, MapPin } from 'lucide-react';
import clsx from 'clsx';

const COUNTRIES = ["United Kingdom", "United States", "Canada", "Trinidad and Tobago", "Europe", "Australia"];

export default function TeamJoin() {
  const { session, profile, subscription } = useOutletContext<any>();
  const [tab, setTab] = useState<'join'|'create'>('join');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('United Kingdom');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    setIsSearching(true);
    let query = supabase.from('teams').select('*').ilike('TeamName', `%${searchQuery}%`);
    // Assuming country is stored in team or we just show a hardcoded list for UK
    const { data } = await query;
    setSearchResults(data || []);
    setIsSearching(false);
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscription || subscription.plan_name !== 'Enterprise') {
      alert("You must be on the Enterprise plan to create a team.");
      return;
    }
    
    setLoading(true);
    const TeamId = 'T' + Math.floor(Math.random() * 1000000);
    const { error } = await supabase.from('teams').insert([{ TeamName: teamName, TeamId }]);
    
    if (!error) {
      alert(`Team ${teamName} created successfully!`);
      setTeamName('');
    } else {
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-8 flex flex-col gap-8">
      <div className="flex flex-col items-center text-center gap-2">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
          <Users className="w-8 h-8 text-black" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
        <p className="text-gray-500">Join a program or register your own.</p>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-xl">
        <button 
          className={clsx("flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors", tab === 'join' ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black")}
          onClick={() => setTab('join')}
        >
          Join a Team
        </button>
        <button 
          className={clsx("flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors", tab === 'create' ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black")}
          onClick={() => setTab('create')}
        >
          Create Team
        </button>
      </div>

      {tab === 'join' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Country / Region</label>
            <select 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
              value={selectedCountry}
              onChange={e => setSelectedCountry(e.target.value)}
            >
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Search Team</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Team name..." 
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button onClick={handleSearch} className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
                Search
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-4">
            {isSearching ? (
              <div className="text-center text-gray-500">Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map(team => (
                <div key={team.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
                  <div>
                    <div className="font-bold">{team.TeamName}</div>
                    <div className="text-xs text-gray-500">ID: {team.TeamId}</div>
                  </div>
                  <button className="px-4 py-2 bg-gray-100 text-black rounded-lg text-sm font-medium hover:bg-gray-200">Request to Join</button>
                </div>
              ))
            ) : searchQuery && !isSearching ? (
              <div className="text-center bg-gray-50 rounded-xl p-8 border border-gray-100 flex flex-col items-center gap-4">
                <MapPin className="w-8 h-8 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900">No team found named "{searchQuery}" in {selectedCountry}.</div>
                  <div className="text-sm text-gray-500">Check the spelling or request a new team registration.</div>
                </div>
                <button className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                  Request a Team
                </button>
              </div>
            ) : (
              selectedCountry === 'United Kingdom' && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center text-blue-900 flex flex-col gap-2 items-center">
                  <div className="font-bold">UK Major Teams</div>
                  <div className="text-sm opacity-80 max-w-xs">Major athletic programs in the United Kingdom are available for free registration.</div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {tab === 'create' && (
        <form onSubmit={handleCreateTeam} className="flex flex-col gap-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex flex-col gap-2 text-center items-center mb-4">
            <h2 className="text-xl font-bold">Register a New Team</h2>
            <p className="text-sm text-gray-500">Requires an Enterprise subscription plan.</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Team Name</label>
            <input 
              required
              type="text" 
              placeholder="e.g. London Lions Elite" 
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black transition-colors"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full py-3.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Creating...' : <><Plus className="w-4 h-4"/> Create Team</>}
          </button>
        </form>
      )}

    </div>
  );
}
