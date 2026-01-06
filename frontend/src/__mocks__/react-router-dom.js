const React = require('react');

const mockNavigate = jest.fn();
const mockLocation = { pathname: '/' };

const useNavigate = () => mockNavigate;
const useLocation = () => mockLocation;

const BrowserRouter = ({ children }) => React.createElement('div', { 'data-testid': 'browser-router' }, children);
const Routes = ({ children }) => React.createElement('div', { 'data-testid': 'routes' }, children);
const Route = ({ element }) => element;
const Link = ({ to, children, ...props }) => React.createElement('a', { href: to, ...props }, children);
const NavLink = ({ to, children, ...props }) => React.createElement('a', { href: to, ...props }, children);

module.exports = {
  useNavigate,
  useLocation,
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
};