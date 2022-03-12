import React, { useCallback, useEffect, useRef, useState } from 'react'
import './styles.css'
import { headerList, dataList, options, createNewRow, rowToObject } from './data'
import DatePicker from '@mui/lab/DatePicker';
import TextField from '@mui/material/TextField';
import { OptionType, TableDataType } from './types'
import DebounceTextField from '../DebounceTextField';
import { Autocomplete, Button, Fab, Tooltip } from '@mui/material';
import DebounceTextareaAutosize from '../DebounceTextareaAutosize';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/RemoveCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EditIcon from '@mui/icons-material/Edit'
import CancelIcon from '@mui/icons-material/Cancel'
import IconButton from '@mui/material/IconButton';
import moment from 'moment';
import ImportManagementController from '../../../../controllers/import-management'
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import { checkOrderETANotif } from '../../../../utils';
const { v4: uuidv4 } = require('uuid')

const headerListDefault = [...headerList]
const dataListDefault = [...dataList]
const ICON_COLOR = '#888888'

const Table = ({headerList = headerListDefault, dataList = dataListDefault, ...props}) => {
    const [width, setWidth] = useState('100%')
    const headerRef = useRef()
    const [data, setData] = useState(dataList)

    // const setData = useCallback((_data) => {
    //     if (typeof _data == 'function') {
    //         setDataState(x => {
    //             const newData = _data(x)
    //             let notDoneOrderList = []
    //             let doneOrderList = []
    //             for (let row of newData) {
    //                 if (row.cells[11].value == 'Done' && !(row.editing)) {
    //                     doneOrderList.push(row)
    //                 } else {
    //                     notDoneOrderList.push(row)
    //                 }
    //             }
    //             const sorted = [...notDoneOrderList, ...doneOrderList]
    //             return sorted
    //         })
    //     } else {
    //         setDataState(x => {
    //             let notDoneOrderList = []
    //             let doneOrderList = []
    //             for (let row of _data) {
    //                 if (row.cells[11].value == 'Done' && !(row.editing)) {
    //                     doneOrderList.push(row)
    //                 } else {
    //                     notDoneOrderList.push(row)
    //                 }
    //             }
    //             const sorted = [...notDoneOrderList, ...doneOrderList]
    //             return sorted
    //         })
    //     }
    // }, [setDataState])

    useEffect(() => {
        const mappedData = dataList.map(item => {
            item.tempId = item.Id || uuidv4()
            return item
        })
        setData(mappedData)
        // setData(dataList)
    }, [dataList])

    useEffect(() => {
        const handleResize = () => {
            if (headerRef.current?.scrollWidth) {
            setWidth(headerRef.current?.scrollWidth)
            }
        }
        
        handleResize()

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [headerList, setWidth])

    const onClickCreateNewRow = useCallback(() => {
        setData(x => {
            let newData = [...x]
            newData.unshift({cells: createNewRow({}), editing: true, tempId: uuidv4()})
            return newData
        })
    }, [])

    console.log('data: ', data)

    const renderHeaderList = useCallback(() => {
        return (
            <div ref={headerRef} className='table-header'>
                <div
                    key={`table-header-item-#`}
                    className='table-header-item'
                >
                    {'#'}
                </div>
                {headerList.map(item => (
                    <div
                        key={`table-header-item-${item.title}`}
                        className='table-header-item'
                        style={{width: item.width}}
                    >
                        {item.title}
                    </div>
                ))}
            </div>
        )
    }, [headerList])

    const onClickEditRow = useCallback((rowTempId) => {
        return () => {
            setData(x => {
                let newData = [...x]
                let row = newData.find(row => row.tempId === rowTempId)
                if (row) row.editing = true
                return newData
            })
        }
    }, [])

    const onClickCancelEditRow = useCallback((rowTempId) => {
        return () => {
            setData(x => {
                let newData = [...x]
                let row = newData.find(row => row.tempId === rowTempId)
                if (row) row.editing = false
                return newData
            })
        }
    }, [])

    const onClickSaveRow = useCallback((rowTempId) => {
        return async () => {
            let row = data.find(r => r.tempId === rowTempId)
            const order = rowToObject(row.cells, row.Id)
            const result = await ImportManagementController.updateOrder(order)
            if (result.isSuccess) {
                setData(x => {
                    let newData = [...x]
                    let row = newData.find(row => row.tempId === rowTempId)
                    row.editing = false
                    return newData
                })
            }
        }
    }, [data])

    const onClickDeleteRow = useCallback((rowTempId) => {
        return async () => {
            let row = data.find(row => row.tempId === rowTempId)
            const result = await ImportManagementController.deleteOrder(row.Id)
            if (result.isSuccess) {
                setData(x => {
                    let newData = [...x]
                    let rowIndex = newData.findIndex(row => row.tempId === rowTempId)
                    newData.splice(rowIndex, 1)
                    return newData
                })
            }
        }
    }, [data])

    const onClickDeleteProduct = useCallback((rowTempId, cellIndex, productIndex) => {
        return () => {
            setData(x => {
                let newData = [...x]
                let row = newData.find(row => row.tempId === rowTempId)
                if (row.cells[cellIndex].value) {
                    row.cells[cellIndex].value[productIndex].Deleted = true
                }
                return newData
            })
        }
    }, [])

    const onClickAddProduct = useCallback((rowTempId, cellIndex) => {
        return (event) => {
            setData(x => {
                let newData = [...x]
                let row = newData.find(row => row.tempId === rowTempId)
                row.cells[cellIndex].value = row.cells[cellIndex].value || []
                let productItem = {
                    Name: '',
                    Amount: 0,
                    Unit: 'KG',
                    Purity: 0,
                    Germination: 0,
                    Lot: ''
                }
                row.cells[cellIndex].value.push(productItem)
                
                return newData
            })

            const productItem =  event.target?.closest(".product-item-editing")
            const listEl = productItem?.getElementsByClassName('product-list')[0]
            setTimeout(() => {
                listEl.scrollTop = listEl.scrollHeight
                const productNameEl = listEl.lastChild?.getElementsByClassName('product-name')[0]
                const productNameInputEl = productNameEl?.getElementsByTagName('input')[0]
                productNameInputEl?.focus()
            }, 500)
        }
    }, [])

    const renderCell = useCallback((rowTempId, cellIndex) => {
        let row = data.find(row => row.tempId === rowTempId)
        const cell = row.cells[cellIndex]

        switch (cell.type) {
            case TableDataType.Date:
                if (row.editing) {
                    return (
                        <DatePicker
                            label="Select a date"
                            value={cell.value}
                            onChange={(newValue) => {
                                setData(x => {
                                    let newData = [...x]
                                    let row = newData.find(row => row.tempId === rowTempId)
                                    row.cells[cellIndex].value = newValue
                                    return newData
                                })
                            }}
                            renderInput={(params) => <TextField {...params} size='small' />}
                        />
                    )
                }

                return moment(cell.value).format('MM/DD/YYYY')
            case TableDataType.Text:
                if (row.editing) {
                    return (
                        <DebounceTextareaAutosize value={cell.value} onChange={(value) => {
                            setData(x => {
                                let newData = [...x]
                                let row = newData.find(row => row.tempId === rowTempId)
                                row.cells[cellIndex].value = value
                                return newData
                            })
                        }} />
                    )
                }

                return cell.value
            case TableDataType.AutoComplete:
                if (row.editing) {
                    return (
                        <Autocomplete
                            options={options[cell.optionType]}
                            getOptionLabel={option => option.name}
                            renderOption={(props, option) => {
                                return (
                                  <span {...props} style={{ color: '#000' }}>
                                    {option.name}
                                  </span>
                                );
                              }}
                            sx={{ width: 200 }}
                            renderInput={(params) => <TextField
                                {...params}
                                label="Select a value"
                                size='small'
                            />}
                            value={options[cell.optionType].find(o => o.code === cell.value)}
                            onChange={(event, newValue) => {
                                setData(x => {
                                    let newData = [...x]
                                    let row = newData.find(row => row.tempId === rowTempId)
                                    row.cells[cellIndex].value = newValue.code
                                    return newData
                                })
                            }}
                        />
                    )
                }

                return cell.value

            case TableDataType.Select:
                if (row.editing) {
                    return (
                        <Select
                            value={cell.value}
                            size={'small'}
                            sx={{ width: 200 }}
                            onChange={(event) => {
                                setData(x => {
                                    let newData = [...x]
                                    let row = newData.find(row => row.tempId === rowTempId)
                                    row.cells[cellIndex].value = event.target.value
                                    return newData
                                })
                            }}
                        >
                            {options[cell.optionType].map((o, i) => (
                                <MenuItem key={`select-item-${i}`} value={o.code}>{o.name}</MenuItem>
                            ))}
                        </Select>
                    )
                }

                if (cell.optionType === OptionType.ShipmentStatus)
                    return (
                        <div
                            style={{
                                padding: '4px 8px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: 4,
                                backgroundColor: {Preparing: '#fff', Inprogress: '#1d8cf8', Done: '#0f0', Canceled: '#737375'}[cell.value],
                                color: {Preparing: '#000', Inprogress: '#fff', Done: '#000', Canceled: '#fff'}[cell.value]
                            }}
                        >
                            <div>{cell.value}</div>
                        </div>
                    )
                return cell.value
            case TableDataType.Custom.Product: {
                let cellValues = cell.value || []
                if (row.editing) {
                    return (
                        <div className='product-item-editing'>
                            <div style={{maxHeight: 300, overflowY: 'scroll'}} className='product-list'>
                                {cellValues.map((item, valueIndex) => item.Deleted ? null : (
                                    <div key={`product-item-${row.tempId}-${valueIndex}`} style={{borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.16)', borderStyle: 'solid', borderRadius: 4, padding: 8, marginBottom: 8}} className='product-item'>
                                        <DebounceTextField
                                            className='product-name'
                                            value={item.Name}
                                            label='Product name'
                                            style={{width: '100%'}}
                                            onChange={(newValue) => {
                                                setData(x => {
                                                    let newData = [...x]
                                                    let row = newData.find(row => row.tempId === rowTempId)
                                                    row.cells[cellIndex].value[valueIndex].Name = newValue
                                                    return newData
                                                })
                                            }}
                                        />
                                        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 8}}>
                                            <DebounceTextField 
                                                type='number' 
                                                style={{width: '48%'}} 
                                                label='Amount' 
                                                value={item.Amount}
                                                onChange={(newValue) => {
                                                    setData(x => {
                                                        let newData = [...x]
                                                        let row = newData.find(row => row.tempId === rowTempId)
                                                        row.cells[cellIndex].value[valueIndex].Amount = newValue
                                                        return newData
                                                    })
                                                }} 
                                            />
                                            <Autocomplete
                                                style={{width: '48%'}}
                                                options={options[OptionType.Unit]}
                                                getOptionLabel={option => option.name}
                                                renderOption={(props, option) => {
                                                    return (
                                                    <span {...props} style={{ color: '#000' }}>
                                                        {option.name}
                                                    </span>
                                                    );
                                                }}
                                                sx={{ width: 200 }}
                                                renderInput={(params) => <TextField
                                                    {...params}
                                                    label="Unit"
                                                    size='small'
                                                />}
                                                value={options[OptionType.Unit].find(o => o.code === item.Unit)}
                                                onChange={(event, newValue) => {
                                                    setData(x => {
                                                        let newData = [...x]
                                                        let row = newData.find(row => row.tempId === rowTempId)
                                                        row.cells[cellIndex].value[valueIndex].Unit = newValue.code
                                                        return newData
                                                    })
                                                }}
                                            />
                                        </div>
                                        
                                        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 8}}>
                                            <DebounceTextField 
                                                type='number' 
                                                style={{width: '48%'}} 
                                                label='Purity'
                                                value={item.Purity}
                                                onChange={(newValue) => {
                                                    setData(x => {
                                                        let newData = [...x]
                                                        let row = newData.find(row => row.tempId === rowTempId)
                                                        row.cells[cellIndex].value[valueIndex].Purity = newValue
                                                        return newData
                                                    })
                                                }}
                                            />
                                            <DebounceTextField 
                                                type='number'
                                                style={{width: '48%', fontSize: 12}} 
                                                label='Germination'
                                                value={item.Germination}
                                                onChange={(newValue) => {
                                                    setData(x => {
                                                        let newData = [...x]
                                                        let row = newData.find(row => row.tempId === rowTempId)
                                                        row.cells[cellIndex].value[valueIndex].Germination = newValue
                                                        return newData
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 8}}>
                                            <DebounceTextField
                                                value={item.Lot} 
                                                label='Lot' 
                                                style={{width: '48%'}}
                                                onChange={(newValue) => {
                                                    setData(x => {
                                                        let newData = [...x]
                                                        let row = newData.find(row => row.tempId === rowTempId)
                                                        row.cells[cellIndex].value[valueIndex].Lot = newValue
                                                        return newData
                                                    })
                                                }}
                                            />
                                            <Button startIcon={<RemoveIcon />} color='error' variant='contained' size='small' onClick={onClickDeleteProduct(row.tempId, cellIndex, valueIndex)}>
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{marginTop: cellValues?.filter(val => !(val.Deleted)).length ? 24 : 0, display: 'flex', width: '100%', justifyContent: 'center'}}>
                                <Button startIcon={<AddIcon />} color='primary' variant='contained' size='small' onClick={onClickAddProduct(row.tempId, cellIndex)}>
                                    Add Product
                                </Button>
                            </div>
                        </div>
                    )
                }

                return (
                    <div style={{maxHeight: 200, overflowY: 'scroll'}}>
                        {
                            cellValues.filter(val => !(val.Deleted)).map((value, prodIndex) => (
                                <div
                                    key={`product-item-text-row-${row.tempId}-prod-${prodIndex}`}
                                    style={{whiteSpace: 'initial', paddingLeft: 8, textIndent: -9, marginTop: prodIndex > 0 ? 4 : 0}}
                                >
                                    &bull; {`${value.Name}${value.Lot ? ' - Lot ' + value.Lot : ''}${value.Amount ? ' - ' + value.Amount + value.Unit : ''}${value.Purity ? ' - Purity ' + value.Purity : ''}${value.Germination ? ' - Germination ' + value.Germination : ''}`}
                                </div>)
                            )
                        }
                    </div>
                )
            }
            default: return cell.value
        }
    }, [data, onClickAddProduct, onClickDeleteProduct])

    const renderDataList = useCallback(() => {
        return (
            <div className='table-content'>
                {data.map((row, rowIndex) => (
                    <div key={`table-row-${rowIndex}`} className={`table-row ${checkOrderETANotif(row) ? 'order-ETA-notif' : ''}`}>
                        <div key={`table-cell-#`} className='table-cell' style={{display: 'flex', justifyContent: 'center'}}>
                            {`${rowIndex}`}
                            <div style={{display: 'flex', justifyContent: 'center', position: 'absolute', width: '100%', marginTop: 16}}>
                                <Tooltip title='Delete'>
                                    <IconButton size='small' onClick={onClickDeleteRow(row.tempId)}>
                                        <DeleteIcon sx={{ color: ICON_COLOR }} />
                                    </IconButton>
                                </Tooltip>
                                {row.editing ? (
                                    <>
                                        <Tooltip title='Save'>
                                            <IconButton size='small' onClick={onClickSaveRow(row.tempId)}>
                                                <CheckCircleIcon sx={{ color: ICON_COLOR }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title='Cancel'>
                                            <IconButton size='small' onClick={onClickCancelEditRow(row.tempId)}>
                                                <CancelIcon sx={{ color: ICON_COLOR }} />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                ) : (
                                    <Tooltip title='Edit'>
                                        <IconButton size='small' onClick={onClickEditRow(row.tempId)}>
                                            <EditIcon sx={{ color: ICON_COLOR }} />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </div>
                        </div>
                        {row?.cells?.map((cell, cellIndex) => (
                            <div
                                key={`table-cell-${cellIndex}`}
                                className='table-cell'
                                style={{width: headerList[cellIndex].width}}
                            >
                                {renderCell(row.tempId, cellIndex)}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        )
    }, [data, headerList, onClickCancelEditRow, onClickDeleteRow, onClickEditRow, onClickSaveRow, renderCell])

    return (
        <div className='table-container' style={{width: width}}>
            {renderHeaderList()}
            {renderDataList()}
            <Tooltip title='Create new Order'>
                <Fab color='primary' aria-label="add" style={{position: 'fixed', zIndex: 2, right: '5vw', top: '80vh'}} onClick={onClickCreateNewRow}>
                    <AddIcon />
                </Fab>
            </Tooltip>
        </div>
    )
}
  
export default Table
  