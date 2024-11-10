import React from 'react';
import { Link } from 'react-router-dom';
import LogOutButton from '../LogOutButton/LogOutButton';
import './Nav.css';
import { useSelector } from 'react-redux';

function Nav() {
  const user = useSelector((store) => store.user);

  return (
    <div className="nav">
      
      <Link to="/stocks">
        <h2 className="nav-title">Straw Hat Stock Exchange</h2>
      </Link>
      <div className="links">
      <Link className="navLink" to="/stocks">
        Home
      </Link>
      <Link className="navLink" to="/leaderboards">
        Leaderboards
      </Link>
        {/* If no user is logged in, show these links */}
        {!user.id && (
          // If there's no user, show login/registration links
          <Link className="navLink" to="/login">
            Login / Register
          </Link>
        )}

        {/* If a user is logged in, show these links */}
        {user.id && (
          <>
            
            <Link className="navLink" to={`/portfolio/${user.id}`}>
              Portfolio
            </Link>
            <LogOutButton className="navLink" />
          </>
        )}

        <Link className="navLink" to="/about">
          About
        </Link>
      </div>
      <div>{user.balance && (<p className="balanceDisplay">Balance: {user.balance} Berries</p>)}</div>
    </div>
  );
}

export default Nav;
