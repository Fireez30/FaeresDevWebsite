import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PokemonGenerator from './PokemonGenerator.jsx';
import Empty from './Empty.jsx';
function CustomRouter() {
    const router = createBrowserRouter([
        {
            path: '/',
            element: <div/>,
        },
        {
            path: '/pokemon',
            element: <PokemonGenerator />,
        },
        {
            path: '/others',
            element: <Empty />,
        },
    ]);
    return (
        <RouterProvider router={router} />
    );
}


export default CustomRouter;