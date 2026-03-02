import Sidebar from './Sidebar';

const Layout = ({ title, children }) => (
  <div className="layout">
    <Sidebar />
    <div className="main-area">
      <div className="topbar">
        <h1 className="topbar-title">{title}</h1>
      </div>
      <div className="page-content">
        {children}
      </div>
    </div>
  </div>
);

export default Layout;
