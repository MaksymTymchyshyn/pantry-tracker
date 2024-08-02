'use client'

import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material'
import { firestore } from './firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemQuantity, setItemQuantity] = useState(1)
  const [editMode, setEditMode] = useState(false)
  const [currentItem, setCurrentItem] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
  }

  const addItem = async (item, quantity) => {
    const docRef = doc(collection(firestore, 'inventory'), item.toLowerCase())
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data()
      await setDoc(docRef, { quantity: existingQuantity + quantity })
    } else {
      await setDoc(docRef, { quantity })
    }
    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item.toLowerCase())
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }

  const removeAllItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item.toLowerCase());
    await deleteDoc(docRef);
    await updateInventory();
  };

  const editItem = async (oldItem, newItem, quantity) => {
    const oldDocRef = doc(collection(firestore, 'inventory'), oldItem.toLowerCase())
    const newDocRef = doc(collection(firestore, 'inventory'), newItem.toLowerCase())
    const oldDocSnap = await getDoc(oldDocRef)

    if (oldDocSnap.exists()) {
      await setDoc(newDocRef, { quantity })
      if (oldItem.toLowerCase() !== newItem.toLowerCase()) {
        await deleteDoc(oldDocRef)
      }
    } else {
      await setDoc(newDocRef, { quantity: 1 })
    }
    await updateInventory()
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => {
    setEditMode(false)
    setItemName('')
    setItemQuantity(1)
    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  const handleEditOpen = (item, quantity) => {
    setOpen(true)
    setEditMode(true)
    setCurrentItem(item)
    setItemName(item)
    setItemQuantity(quantity)
  }

  const filteredInventory = inventory.filter(({ name }) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
      sx={{
        background: 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)', // Purple/blue/pink gradient
        backgroundSize: '200% 200%',
        animation: 'gradientAnimation 15s ease infinite', // Adding an animation for dynamic effect
        color: 'white',
      }}
    >
      <Stack direction="row" spacing={2} sx={{ marginBottom: 2 }}>
        <TextField
          id="search-bar"
          placeholder="Search Item" // Use placeholder instead of label
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            width: '240px',
            bgcolor: 'white',
            borderRadius: 1,
            '& input::placeholder': {
              opacity: 1, // Ensure placeholder is visible
            }
          }}
          InputLabelProps={{
            shrink: false, // Prevent label from shrinking
          }}
        />
        <Button variant="contained" onClick={handleOpen} sx={{ bgcolor: '#444' }}>
          Add New Item
        </Button>
      </Stack>
      <Box
        border={'1px solid #333'}
        sx={{
          background: 'linear-gradient(135deg, #000, #444, #888)', // Black/gray/white gradient
          borderRadius: 2,
          padding: 2,
        }}
      >
        <Box
          width="800px"
          height="100px"
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          sx={{
            background: 'linear-gradient(135deg, #333, #555, #777)',
            borderRadius: 1,
            marginBottom: 2,
          }}
        >
          <Typography variant={'h2'} color={'#fff'} textAlign={'center'}>
            Inventory Items
          </Typography>
        </Box>
        <Stack width="800px" height="300px" spacing={2} overflow={'auto'}>
          {filteredInventory.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="150px"
              display={'flex'}
              justifyContent={'space-between'} // Align items to the left
              alignItems={'center'}
              sx={{
                bgcolor: '#222',
                borderRadius: 1,
                paddingX: 5,
                color: 'white',
                textAlign: 'left', // Align text to the left
              }}
            >
              <Typography variant={'h4'} color={'#fff'}>
                {name.charAt(0).toUpperCase() + name.slice(1)} Quantity: {quantity}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={() => handleEditOpen(name, quantity)} sx={{ bgcolor: '#666' }}>
                  Edit
                </Button>
                <Button variant="contained" onClick={() => removeItem(name)} sx={{ bgcolor: '#666' }}>
                  Minus One
                </Button>
                <Button variant="contained" onClick={() => removeAllItem(name)} sx={{ bgcolor: '#666' }}>
                  Remove
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {editMode ? 'Edit Item' : 'Add Item'}
          </Typography>
          <Stack width="100%" direction={'column'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <TextField
              id="outlined-quantity"
              label="Quantity"
              variant="outlined"
              fullWidth
              type="number"
              value={itemQuantity}
              onChange={(e) => setItemQuantity(parseInt(e.target.value))}
            />
            <Button
              variant="outlined"
              onClick={() => {
                if (editMode) {
                  editItem(currentItem, itemName, itemQuantity)
                } else {
                  addItem(itemName, itemQuantity)
                }
                setItemName('')
                setItemQuantity(1)
                handleClose()
              }}
            >
              {editMode ? 'Edit' : 'Add'}
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  )
}
