import React from 'react'
import ReactDOM from 'react-dom'
import * as serviceWorker from './serviceWorker'
import App from './pages/App'
import { BrowserRouter as Router} from 'react-router-dom'
import { Provider } from 'mobx-react'
import stores from './store'

ReactDOM.render(
    <Router>
        <Provider {...stores}>
            <App />    
        </Provider>  
    </Router>
    , document.getElementById('root'))

serviceWorker.unregister()
