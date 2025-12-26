
import React, { useState } from 'react';
import CalaverrasGrantsDashboard from './components/CalaverrasGrantsDashboard';
import UserTypeSelector from './components/UserTypeSelector';
import DepartmentSelector from './components/DepartmentSelector';

function App() {
  const [userType, setUserType] = useState(null);
  const [subType, setSubType] = useState(null);

  if (!userType) {
    return <UserTypeSelector userType={userType} onUserTypeSelect={setUserType} />;
  }
  if (!subType) {
    return <DepartmentSelector userType={userType} subType={subType} onSubTypeSelect={setSubType} />;
  }

  // Pass userType and subType as props if needed
  return <CalaverrasGrantsDashboard userType={userType} subType={subType} />;
}

export default App;
