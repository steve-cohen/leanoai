import { Route, Routes } from 'react-router-dom'
import Dashboard from './Components/Dashboard/Dashboard'
import Home from './Components/Home/Home'

import './App.css'
import './Form.css'
import './Table.css'

const version = 'v65.0.1'

export default function App() {
	return (
		<div className='App'>
			<Routes>
				<Route path='/dashboard/*' element={<Dashboard version={version} />} />
				<Route path='*' element={<Home version={version} />} />
			</Routes>
		</div>
	)
}
