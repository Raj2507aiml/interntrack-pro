import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tracker from './pages/Tracker';
import Settings from './pages/Settings';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ToastContainer from './components/ToastContainer';
import ApplicationModal from './components/ApplicationModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';

function App() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  // Mobile Sidebar layout state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modals management state
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState(null);

  // Modal actions
  const handleOpenAddModal = () => {
    setEditingApp(null);
    setAppModalOpen(true);
  };

  const handleOpenEditModal = (app) => {
    setEditingApp(app);
    setAppModalOpen(true);
  };

  const handleDeleteClick = (app) => {
    setAppToDelete(app);
    setDeleteModalOpen(true);
  };

  // Add & Edit Application submit handler
  const handleSaveApplication = async (appData) => {
    if (!currentUser) return;

    if (editingApp) {
      // Update existing record
      const appRef = doc(db, 'applications', editingApp.id);
      await updateDoc(appRef, {
        ...appData,
        updatedAt: serverTimestamp()
      });
      showToast('Application updated successfully!', 'success');
    } else {
      // Add new record
      await addDoc(collection(db, 'applications'), {
        ...appData,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      showToast('New application tracked successfully!', 'success');
    }
  };

  // Delete Application handler
  const handleConfirmDelete = async () => {
    if (!appToDelete) return;
    
    try {
      await deleteDoc(doc(db, 'applications', appToDelete.id));
      showToast(`Deleted ${appToDelete.company} application.`, 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to delete application: ' + error.message, 'error');
    } finally {
      setDeleteModalOpen(false);
      setAppToDelete(null);
    }
  };

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        <Routes>
          {/* Public Auth Routes */}
          <Route 
            path="/login" 
            element={currentUser ? <Navigate to="/" replace /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={currentUser ? <Navigate to="/" replace /> : <Register />} 
          />

          {/* Protected Dashboard Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="dashboard-layout">
                  <Sidebar 
                    mobileOpen={mobileSidebarOpen} 
                    closeSidebar={() => setMobileSidebarOpen(false)} 
                  />
                  
                  <div className="main-content">
                    <Navbar 
                      toggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
                    />
                    
                    <main className="dashboard-viewport">
                      <Routes>
                        <Route 
                          path="/" 
                          element={<Dashboard onOpenAddModal={handleOpenAddModal} />} 
                        />
                        <Route 
                          path="/tracker" 
                          element={
                            <Tracker 
                              onOpenAddModal={handleOpenAddModal} 
                              onOpenEditModal={handleOpenEditModal}
                              onDeleteClick={handleDeleteClick}
                            />
                          } 
                        />
                        <Route 
                          path="/settings" 
                          element={<Settings />} 
                        />
                        {/* Fallback inside dashboard */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>

        {/* Global Modal Forms */}
        <ApplicationModal 
          isOpen={appModalOpen} 
          onClose={() => setAppModalOpen(false)}
          onSave={handleSaveApplication}
          application={editingApp}
        />

        <DeleteConfirmationModal 
          isOpen={deleteModalOpen} 
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          company={appToDelete?.company}
          role={appToDelete?.role}
        />

        {/* Global Toast notifications renderer */}
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
