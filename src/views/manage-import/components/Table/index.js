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

const headerListDefault = [...headerList]
const dataListDefault = [...dataList]
const ICON_COLOR = '#888888'

const Table = ({headerList = headerListDefault, dataList = dataListDefault, ...props}) => {
    const [width, setWidth] = useState('100%')
    const headerRef = useRef()
    const [data, setData] = useState(dataList)

    useEffect(() => {
        // const mappedData = dataList.map(cells => ({cells: cells, editing: false}))
        // setData(mappedData)
        setData(dataList)
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
            newData.unshift({cells: createNewRow({}), editing: true})
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

    const onClickEditRow = useCallback((rowIndex) => {
        return () => {
            setData(x => {
                let newData = [...x]
                newData[rowIndex].editing = true
                return newData
            })
        }
    }, [])

    const onClickCancelEditRow = useCallback((rowIndex) => {
        return () => {
            setData(x => {
                let newData = [...x]
                newData[rowIndex].editing = false
                return newData
            })
        }
    }, [])

    const onClickSaveRow = useCallback((rowIndex) => {
        return async () => {
            const order = rowToObject(data[rowIndex].cells, data[rowIndex].Id)
            const result = await ImportManagementController.updateOrder(order)
            if (result.isSuccess) {
                setData(x => {
                    let newData = [...x]
                    newData[rowIndex].editing = false
                    return newData
                })
            }
        }
    }, [data])

    const onClickDeleteRow = useCallback((rowIndex) => {
        return async () => {
            const result = await ImportManagementController.deleteOrder(data[rowIndex].Id)
            if (result.isSuccess) {
                setData(x => {
                    let newData = [...x]
                    newData.splice(rowIndex, 1)
                    return newData
                })
            }
        }
    }, [data])

    const onClickDeleteProduct = useCallback((rowIndex, cellIndex, productIndex) => {
        return () => {
            setData(x => {
                let newData = [...x]
                if (newData[rowIndex].cells[cellIndex].value) {
                    newData[rowIndex].cells[cellIndex].value[productIndex].Deleted = true
                }
                return newData
            })
        }
    }, [])

    const onClickAddProduct = useCallback((rowIndex, cellIndex) => {
        return () => {
            setData(x => {
                let newData = [...x]
                if (newData[rowIndex].cells[cellIndex].value) {
                    let productItem = {
                        Name: '',
                        Amount: 0,
                        Unit: 'KG',
                        Purity: 0,
                        Germination: 0,
                        Lot: ''
                    }
                    newData[rowIndex].cells[cellIndex].value.push(productItem)
                }
                return newData
            })
        }
    }, [])

    const renderCell = useCallback((rowIndex, cellIndex) => {
        const cell = data[rowIndex].cells[cellIndex]

        switch (cell.type) {
            case TableDataType.Date:
                if (data[rowIndex].editing) {
                    return (
                        <DatePicker
                            label="Select a date"
                            value={cell.value}
                            onChange={(newValue) => {
                                setData(x => {
                                    let newData = [...x]
                                    newData[rowIndex].cells[cellIndex].value = newValue
                                    return newData
                                })
                            }}
                            renderInput={(params) => <TextField {...params} size='small' />}
                        />
                    )
                }

                return moment(cell.value).format('MM/DD/YYYY')
            case TableDataType.Text:
                if (data[rowIndex].editing) {
                    return (
                        <DebounceTextareaAutosize value={cell.value} onChange={(value) => {
                            setData(x => {
                                let newData = [...x]
                                newData[rowIndex].cells[cellIndex].value = value
                                return newData
                            })
                        }} />
                    )
                }

                return cell.value
            case TableDataType.AutoComplete:
                if (data[rowIndex].editing) {
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
                                    newData[rowIndex].cells[cellIndex].value = newValue.code
                                    return newData
                                })
                            }}
                        />
                    )
                }

                return cell.value

            case TableDataType.Select:
                if (data[rowIndex].editing) {
                    return (
                        <Select
                            value={cell.value}
                            size={'small'}
                            sx={{ width: 200 }}
                            onChange={(event) => {
                                setData(x => {
                                    let newData = [...x]
                                    newData[rowIndex].cells[cellIndex].value = event.target.value
                                    return newData
                                })
                            }}
                        >
                            {options[cell.optionType].map(o => (
                                <MenuItem value={o.code}>{o.name}</MenuItem>
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
                if (data[rowIndex].editing) {
                    return (
                        <div>
                            {cellValues.map((item, valueIndex) => item.Deleted ? null : (
                                <div style={{borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.16)', borderStyle: 'solid', borderRadius: 4, padding: 8, marginBottom: 8}}>
                                    <DebounceTextField
                                        value={item.Name}
                                        label='Product name'
                                        style={{width: '100%'}}
                                        onChange={(newValue) => {
                                            setData(x => {
                                                let newData = [...x]
                                                newData[rowIndex].cells[cellIndex].value[valueIndex].Name = newValue
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
                                                    newData[rowIndex].cells[cellIndex].value[valueIndex].Amount = newValue
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
                                                    newData[rowIndex].cells[cellIndex].value[valueIndex].Unit = newValue.code
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
                                                    newData[rowIndex].cells[cellIndex].value[valueIndex].Purity = newValue
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
                                                    newData[rowIndex].cells[cellIndex].value[valueIndex].Germination = newValue
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
                                                    newData[rowIndex].cells[cellIndex].value[valueIndex].Lot = newValue
                                                    return newData
                                                })
                                            }}
                                        />
                                        <Button startIcon={<RemoveIcon />} color='error' variant='contained' size='small' onClick={onClickDeleteProduct(rowIndex, cellIndex, valueIndex)}>
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            ))}
    
                            <div style={{marginTop: cellValues?.filter(val => !(val.Deleted)).length ? 24 : 0, display: 'flex', width: '100%', justifyContent: 'center'}}>
                                <Button startIcon={<AddIcon />} color='primary' variant='contained' size='small' onClick={onClickAddProduct(rowIndex, cellIndex)}>
                                    Add Product
                                </Button>
                            </div>
                        </div>
                    )
                }

                return (
                    <div>
                        {
                            cellValues.filter(val => !(val.Deleted)).map((value, prodIndex) => (
                                <div
                                    key={`product-item-text-row-${rowIndex}-prod-${prodIndex}`}
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
                    <div key={`table-row-${rowIndex}`} className='table-row'>
                        <div key={`table-cell-#`} className='table-cell' style={{display: 'flex', justifyContent: 'center'}}>
                            {`${rowIndex}`}
                            <div style={{display: 'flex', justifyContent: 'center', position: 'absolute', width: '100%', marginTop: 16}}>
                                <Tooltip title='Delete'>
                                    <IconButton size='small' onClick={onClickDeleteRow(rowIndex)}>
                                        <DeleteIcon sx={{ color: ICON_COLOR }} />
                                    </IconButton>
                                </Tooltip>
                                {row.editing ? (
                                    <>
                                        <Tooltip title='Save'>
                                            <IconButton size='small' onClick={onClickSaveRow(rowIndex)}>
                                                <CheckCircleIcon sx={{ color: ICON_COLOR }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title='Cancel'>
                                            <IconButton size='small' onClick={onClickCancelEditRow(rowIndex)}>
                                                <CancelIcon sx={{ color: ICON_COLOR }} />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                ) : (
                                    <Tooltip title='Edit'>
                                        <IconButton size='small' onClick={onClickEditRow(rowIndex)}>
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
                                {renderCell(rowIndex, cellIndex)}
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
  