// import fetch from 'node-fetch';

// const authFetch = async (url, method = 'GET', data) => {
//   const user = JSON.parse(localStorage.getItem('user'));

//   if (user) {
//     try {
//       const response = await fetch(url, {
//         method,
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${user.token}`
//         },
//         body: JSON.stringify(data)
//       });

//       if (!response.ok) {
//         throw new Error(response.statusText);
//       }

//       return response.json();
//     } catch (error) {
//       console.log(error);
//       throw error;
//     }
//   } else {
//     throw new Error('User not authenticated');
//   }
// };

// export default authFetch