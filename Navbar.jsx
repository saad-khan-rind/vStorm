import { Link } from "react-router-dom";
import logo from './logo.png';
export const VetNavbar = () => {
  return (

    <nav>
      <div className="navbarHome">
      <img src={logo} alt="logo" className="logo"/>
        {/* <label className="menu__btn" for="menu__toggle">
        </label> */}
        <ul className="menu__box">
          <li><Link id="attr" to="/">Home</Link></li>
          <li><Link id="attr" to="/jobsubmission">Job Submission</Link></li>
        </ul>
      </div>

    </nav>


  );
}