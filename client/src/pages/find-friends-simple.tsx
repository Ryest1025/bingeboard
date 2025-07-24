import { createElement } from "react";

function FindFriendsSimple() {
  return createElement(
    'div',
    { style: { padding: '20px', color: 'white', backgroundColor: '#2c2c2c', minHeight: '100vh' } },
    createElement('h1', null, 'Find Friends'),
    createElement('p', null, 'Friend discovery features coming soon!'),
    createElement(
      'div',
      { style: { marginTop: '20px' } },
      createElement('h2', null, 'Search Users'),
      createElement('input', {
        type: 'text',
        placeholder: 'Search by username...',
        style: {
          padding: '10px',
          borderRadius: '5px',
          border: '1px solid #666',
          backgroundColor: '#333',
          color: 'white',
          width: '300px'
        }
      }),
      createElement(
        'button',
        {
          style: {
            marginLeft: '10px',
            padding: '10px 20px',
            backgroundColor: '#7c3aed',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }
        },
        'Search'
      )
    ),
    createElement(
      'div',
      { style: { marginTop: '30px' } },
      createElement('h2', null, 'Import Contacts'),
      createElement('p', null, 'Connect with friends who are already on BingeBoard.'),
      createElement(
        'button',
        {
          style: {
            padding: '10px 20px',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }
        },
        'Import Contacts'
      )
    )
  );
}

export default FindFriendsSimple;