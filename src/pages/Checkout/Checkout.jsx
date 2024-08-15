import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import './Checkout.module.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get('userId');
  const token = sessionStorage.getItem('token'); // Assuming you store the token in sessionStorage

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/cart/${userId}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );
        setCartItems(response.data);
      } catch (error) {
        console.error('There was an error fetching the cart items!', error);
        setError('Failed to load cart items. Please try again later.');
      }
    };

    fetchCartItems();
  }, [userId, token]);

  const handleDelete = async (itemId) => {
    try {
      console.log('Deleting item with ID:', itemId);
      const response = await axios.delete(
        `http://localhost:3000/api/cart/remove-item/${itemId}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      console.log('Delete response:', response.data);
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== itemId)
      );
    } catch (error) {
      console.error('Error removing item from cart:', error);
      setError('Failed to remove item. Please try again later.');
    }
  };

  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => total + parseFloat(item.price), 0)
      .toFixed(2);
  };

  const handlePurchase = async () => {
    try {
      const totalAmount = calculateTotal();

      await axios.post(
        `http://localhost:3000/api/checkout/${userId}`,
        { totalAmount },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      alert('Products purchased successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error during purchase:', error);
      setError('Failed to complete purchase. Please try again later.');
    }
  };

  if (error) {
    return (
      <>
        <Header />
        <div className="container my-5 mx-5">
          <h1 className="container my-5 py-5">{error}</h1>
          <button onClick={() => navigate('/dashboard')}>
            Go Back to Shop
          </button>
        </div>
        <Footer />
      </>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Header />
        <div className="container my-5 mx-5">
          <h1 className="container my-5 py-5">Your cart is empty!</h1>
          <button onClick={() => navigate('/dashboard')}>
            Go Back to Shop
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container my-5">
        <h1 className="d-flex justify-content-start fs-1 my-5">Checkout</h1>
        <ul>
          {cartItems.map((item) => (
            <li key={item.id}>
              <img src={item.image_url} alt={item.name} />
              <p>{item.name}</p>
              <p>N{item.price}</p>
              <button onClick={() => handleDelete(item.id)}>Remove</button>
            </li>
          ))}
        </ul>
        <h2 className="d-flex justify-content-start fs-1 my-5 pt-5">
          Total: N{calculateTotal()}
        </h2>
        <button className="my-3" onClick={handlePurchase}>
          Purchase
        </button>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;
