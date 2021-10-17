import React from 'react'

const PageLoading = () => {
	return (
		<div style={{
			position: 'fixed',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
			top: '50%',
			left: '50%',
			right: 'auto',
			bottom: 'auto',
			marginRight: '-50%',
			transform: 'translate(-50%, -50%)',
		}}>
			<div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontSize: 20, color: '#fff', fontWeight: 'bold', backgroundColor: 'rgba(41, 6, 82, 0.5)', padding: 24, paddingTop: 30, paddingBottom: 30, borderRadius: '52%' }}>
				<div>Đang loading mợt muốn chớt nè!</div>
				<div style={{ marginTop: 8}}>Chờ xíu!!</div>
			</div>
			<img src={'cute-loading.gif'} style={{width: 100, height: 100}} />
		</div>
	)
}

export default PageLoading