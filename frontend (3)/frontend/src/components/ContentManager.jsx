import React, { useEffect, useState } from 'react';
import './ContentManager.css';
import ProgressBar from './ProgressBar';
import { apibaseurl, callApi, showToast } from '../lib';

const ContentManager = ({ logout, userId }) => {
    const [activeTab, setActiveTab] = useState('drafts'); // 'drafts', 'published', 'search'
    const [isProgress, setIsProgress] = useState(false);
    const [token, setToken] = useState("");
    
    const [drafts, setDrafts] = useState([]);
    const [published, setPublished] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    
    const [showEditor, setShowEditor] = useState(false);
    const [showVersions, setShowVersions] = useState(false);
    const [versions, setVersions] = useState([]);
    
    const [formData, setFormData] = useState({ id: "", title: "", body: "" });

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
            logout();
            return;
        }
        setToken(storedToken);
        loadDrafts(storedToken);
        loadPublished(storedToken);
    }, [userId]);

    const loadDrafts = (tkn = token) => {
        if (!userId) return;
        setIsProgress(true);
        callApi("GET", `${apibaseurl}/draft/author/${userId}`, null, null, (res) => {
            setIsProgress(false);
            if (res && res.code === 200 && Array.isArray(res.data)) {
                setDrafts(res.data);
            } else if (Array.isArray(res)) {
                setDrafts(res);
            }
        }, tkn);
    };

    const loadPublished = (tkn = token) => {
        if (!userId) return;
        setIsProgress(true);
        callApi("GET", `${apibaseurl}/content/author/${userId}`, null, null, (res) => {
            setIsProgress(false);
            if (res && res.code === 200 && Array.isArray(res.data)) {
                setPublished(res.data);
            } else if (Array.isArray(res)) {
                setPublished(res);
            }
        }, tkn);
    };

    const handleSearch = () => {
        if (!searchQuery.trim()) return;
        setIsProgress(true);
        callApi("POST", `${apibaseurl}/content/semantic_search`, { query: searchQuery }, null, (res) => {
            setIsProgress(false);
            if (res.code === 200) {
                setSearchResults(res.data);
                showToast(`Found ${res.data.length} matching result(s).`, "success");
            } else {
                showToast(res.message, "error");
            }
        }, token);
    };

    const handleSaveDraft = () => {
        if (!formData.title || !formData.body) return showToast("Title and body required.", "error");
        setIsProgress(true);
        
        const payload = {
            id: formData.id ? Number(formData.id) : null,
            title: formData.title,
            body: formData.body,
            author_id: Number(userId),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        callApi("POST", `${apibaseurl}/draft/save`, payload, null, (res) => {
            setIsProgress(false);
            const savedDraft = res.data || (res.code === 200 ? res.data : null) || res;
            if (savedDraft && savedDraft.id) {
                showToast("Draft saved successfully!", "success");
                setShowEditor(false);
                loadDrafts();
                
                // Save version
                saveVersion(savedDraft.id.toString(), formData.body, "DRAFT_SAVED");
            } else {
                showToast("Error saving draft: " + (res.message || "Unknown error"), "error");
            }
        }, token);
    };

    const handlePublish = () => {
        if (!formData.title || !formData.body) return showToast("Title and body required.", "error");
        setIsProgress(true);
        
        const payload = {
            title: formData.title,
            body: formData.body,
            author_id: Number(userId),
            originalDraftId: formData.id ? Number(formData.id) : null,
            publishedAt: new Date().toISOString()
        };

        callApi("POST", `${apibaseurl}/content/publish`, payload, null, (res) => {
            setIsProgress(false);
            const savedContent = res.data || (res.code === 200 ? res.data : null) || res;
            if (savedContent && savedContent.id) {
                showToast("Content published successfully!", "success");
                setShowEditor(false);
                loadPublished();
                
                // Save version
                saveVersion(savedContent.id.toString(), formData.body, "CONTENT_PUBLISHED");
            } else {
                showToast("Error publishing content: " + (res.message || "Unknown error"), "error");
            }
        }, token);
    };

    const saveVersion = (contentId, body, action) => {
        const payload = {
            contentId: contentId,
            versionNumber: Date.now(),
            body: body,
            editorId: userId.toString(),
            action: action
        };
        callApi("POST", `${apibaseurl}/content/save_version`, payload, null, () => {}, token);
    };

    const viewVersions = (contentId) => {
        setIsProgress(true);
        callApi("GET", `${apibaseurl}/content/versions/${contentId}`, null, null, (res) => {
            setIsProgress(false);
            if (res.code === 200) {
                setVersions(res.data);
                setShowVersions(true);
                showToast("Loaded version history.", "success");
            } else {
                showToast("Failed to load versions.", "error");
            }
        }, token);
    };

    const openEditor = (item = null) => {
        if (item) {
            setFormData({ id: item.id, title: item.title, body: item.body });
        } else {
            setFormData({ id: "", title: "", body: "" });
        }
        setShowEditor(true);
    };

    return (
        <div className='cmanager'>
            <div className='cmanager-header'>
                <label>Content Publisher</label>
                <div className="tabs">
                    <button className={activeTab === 'drafts' ? 'active' : ''} onClick={() => setActiveTab('drafts')}>Drafts</button>
                    <button className={activeTab === 'published' ? 'active' : ''} onClick={() => setActiveTab('published')}>Published</button>
                    <button className={activeTab === 'search' ? 'active' : ''} onClick={() => setActiveTab('search')}>Semantic Search</button>
                </div>
            </div>

            <div className='cmanager-content'>
                {activeTab === 'drafts' && (
                    <div className="tab-pane">
                        <button className="new-btn" onClick={() => openEditor()}>+ New Draft</button>
                        <table>
                            <thead><tr><th>ID</th><th>Title</th><th>Created At</th><th>Actions</th></tr></thead>
                            <tbody>
                                {drafts.map(d => (
                                    <tr key={d.id}>
                                        <td>{d.id}</td>
                                        <td>{d.title}</td>
                                        <td>{d.createdAt}</td>
                                        <td>
                                            <button onClick={() => openEditor(d)}>Edit</button>
                                            <button onClick={() => viewVersions(d.id.toString())}>Versions</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'published' && (
                    <div className="tab-pane">
                        <table>
                            <thead><tr><th>ID</th><th>Title</th><th>Published At</th><th>Actions</th></tr></thead>
                            <tbody>
                                {published.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.id}</td>
                                        <td>{p.title}</td>
                                        <td>{p.publishedAt}</td>
                                        <td>
                                            <button onClick={() => openEditor(p)}>View</button>
                                            <button onClick={() => viewVersions(p.id.toString())}>Versions</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'search' && (
                    <div className="tab-pane">
                        <div className="search-bar">
                            <input type="text" placeholder="Search semantically (e.g. 'Articles about science')..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            <button onClick={handleSearch}>Search</button>
                        </div>
                        <div className="search-results">
                            {searchResults.map((r, i) => (
                                <div key={i} className="result-card">
                                    <h4>Content ID: {r.contentId}</h4>
                                    <p>{r.textChunk}</p>
                                    <small>Similarity Score: {r.score.toFixed(4)}</small>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {showEditor && (
                <div className='overlay'>
                    <div className='popup editor-popup'>
                        <span className='close' onClick={() => setShowEditor(false)}>&times;</span>
                        <h3>Content Editor</h3>
                        <label>Title*</label>
                        <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                        
                        <label>Body*</label>
                        <textarea rows="10" value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})}></textarea>
                        
                        <div className="actions">
                            <button onClick={handleSaveDraft}>Save Draft</button>
                            <button className="publish-btn" onClick={handlePublish}>Publish Content</button>
                        </div>
                    </div>
                </div>
            )}

            {showVersions && (
                <div className='overlay'>
                    <div className='popup versions-popup'>
                        <span className='close' onClick={() => setShowVersions(false)}>&times;</span>
                        <h3>Version History</h3>
                        <div className="versions-list">
                            {versions.length === 0 ? <p>No versions found.</p> : versions.map((v, i) => (
                                <div key={i} className="version-card">
                                    <p><strong>Version:</strong> {v.versionNumber}</p>
                                    <p><strong>Saved At:</strong> {new Date(v.savedAt).toLocaleString()}</p>
                                    <div className="version-body">{v.body}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <ProgressBar isProgress={isProgress} />
        </div>
    );
};

export default ContentManager;
