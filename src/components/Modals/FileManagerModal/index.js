import React, {useImperativeHandle, forwardRef, useState, useCallback, useEffect} from 'react'
import Modal from 'react-modal'
import ButtonLoader from '../../Layouts/ButtonLoader'
import { api } from '../../../services/api'

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
		width: '50%',
		height: '60%',
		overflow: 'hidden',
  },
}

// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root')

const FileManagerModal = ({}, ref) => {
	const [filenames, setFilenames] = useState([])
	const [visible, setVisible] = useState(false)
	const [data, setData] = useState([])

	useImperativeHandle(ref, () => ({
		setVisible
	}), [setFilenames, setVisible])

	const getFilenames = useCallback(() => {
		api.get('/filenames').then(res => {
			setFilenames(res.data || [])
		})
	}, [])

	useEffect(() => {
		getFilenames()
	}, [])

	useEffect(() => {
		const d = filenames.map(name => ({name: name, isDeleting: false}))
		setData([...d])
	}, [filenames])

	const deleteFile = useCallback((item) => {
		item.isDeleting = true
		setData(x => [...x])
		api.post('/deleteFile', {
			filename: item.name
		}).finally(() => {
			if (item?.isDeleting) {
				item.isDeleting = false
				setData(x => [...x])
			}

			getFilenames()
		})
	}, [])

	return (
		<div>
			<Modal
        isOpen={visible}
        // onAfterOpen={afterOpenModal}
        // onRequestClose={closeModal}
        style={customStyles}
      >
        {/* <h2 ref={(_subtitle) => (subtitle = _subtitle)}>Hello</h2>
        <button onClick={closeModal}>close</button> */}
				<div>
					<div style={{display: 'flex', justifyContent: 'center'}}><h3>File Manager</h3></div>
					<div style={{overflow: 'scroll', height: '80%'}}>
						{data.map((item, index) => (
							<div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: index % 2 == 0 ? '#d7e8f7' : 'white', paddingTop: 4, paddingBottom: 4 }}>
								<div style={{display: 'flex', flexDirection: 'row'}}>
									<div style={{width: 50, textAlign: 'center'}}>{index + 1}</div>
									<div>{item.name}</div>
								</div>
								<ButtonLoader onClick={() => deleteFile(item)} title='Delete' loadingTitle='Delete' buttonStyle={{}} titleStyle={{color: 'red'}} loading={item.isDeleting} />
							</div>
						))}
					</div>
				</div>
				<div style={{display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center', paddingTop: 8}}>
					<button onClick={() => setVisible(false)}><span style={{fontSize: 18, fontWeight: 'bold'}}>Close</span></button>
				</div>
      </Modal>
		</div>
	)
}

export default forwardRef(FileManagerModal)