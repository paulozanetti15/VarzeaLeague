import React from 'react';
import { useNavigate } from 'react-router-dom';

const NavbarBrand: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/')}
      className="navbar-brand"
    >
      VÁRZEA LEAGUE
    </div>
  );
};

export default NavbarBrand;