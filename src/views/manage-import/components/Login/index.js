import { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Button } from 'reactstrap'
import { commonActions } from 'redux/actions'
import { api } from 'services/api'
import DebounceTextField from '../DebounceTextField'

const Login = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const dispatch = useDispatch()

    const login = useCallback(async () => {
        const res = await api.post('/login', {username: username, password: password})
        if (res.data.isSuccess) {
            dispatch(commonActions.setCommon({
                hasLogin: true,
                loginData: res.data.data,
            }))
            // window.location.href = '/inventory-management/import-follow-up'
            dispatch(commonActions.setCommon({loginPage: false}))
        } else {
            alert(res.data.error)
        }
    }, [username, password, dispatch])

    return (
        <div style={{width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <div style={{width: '30%', backgroundColor: '#fff', padding: 24, borderRadius: 8}}>
                <div style={{textAlign: 'center', fontSize: 24, fontWeight: 'bold'}}>Login</div>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <DebounceTextField label='Username' onChange={setUsername} value={username} placeholder='Enter username' style={{marginTop: 24}} />
                    <DebounceTextField label='Password' onChange={setPassword} value={password} placeholder='Enter password' type='password' style={{marginTop: 24}} />
                    <Button onClick={login} style={{marginTop: 24}}>{'Login'}</Button>
                </div>
            </div>
        </div>
    )
}

export default Login