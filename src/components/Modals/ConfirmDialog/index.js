import React, {useImperativeHandle, forwardRef, useState, useCallback, useEffect} from 'react'
import Modal from 'react-modal'
import { api } from '../../../services/api'

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
		// width: '50%',
		// height: '60%',
		overflow: 'hidden',
  },
}

// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root')

const ConfirmDialog = ({title, content, btnYES, btnNO}, ref) => {
	const [visible, setVisible] = useState(false)

	useImperativeHandle(ref, () => ({
		setVisible
	}), [setVisible])

	const onPressBtnYES = useCallback(() => {
		setVisible(false)
		api.post('/activityLog', {
			action: 'answer',
			info: {
				answer: 'yes',
				deviceInfo: navigator.userAgentData
			}
		})
	}, [])

	const onPressBtnNO = useCallback(() => {
		setVisible(false)
		api.post('/activityLog', {
			action: 'answer',
			info: {
				answer: 'no',
				deviceInfo: navigator.userAgentData
			}
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
					<div style={{display: 'flex', justifyContent: 'center'}}><h3>{title}</h3></div>
					<div style={{height: '80%'}}>
						{content || 'Content'}
					</div>
				</div>
				<div style={{display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center', paddingTop: 8}}>
					<div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
						<button onClick={onPressBtnYES}><span style={{fontSize: 18, fontWeight: 'bold'}}>{btnYES || 'YES'}</span></button>
						<button onClick={onPressBtnNO} style={{marginLeft: 24}}><span style={{fontSize: 18, fontWeight: 'bold'}}>{btnNO || 'NO'}</span></button>
					</div>
				</div>
      </Modal>
		</div>
	)
}

export default forwardRef(ConfirmDialog)