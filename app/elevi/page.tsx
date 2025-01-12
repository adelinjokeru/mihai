'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; 
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from '@/utils/supabase';
interface Elev {
  id: number;
  nume: string;
  batalion: string;
  marime_pantof: number;
  dimensiune_uniforma: string;
  varsta: number;
  sex_elev: string;
}

interface Echipament {
  id: number;
  tip: string;
  denumire: string;
  marime: string;
  data_atribuire: string;
  sex: string;
  elev_id: number;
}

export default function EleviPage() {
  const [elevi, setElevi] = useState<Elev[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedElev, setSelectedElev] = useState<Elev | null>(null);
  const [equipments, setEquipments] = useState<Echipament[]>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [elevToDelete, setElevToDelete] = useState<number | null>(null);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);

  const filteredElevi = elevi.filter((elev) => {
    return elev.nume.toLowerCase().includes(searchTerm.toLowerCase()) || elev.batalion.toLowerCase().includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    const fetchElevi = async () => {
      try {
        const response = await fetch('/api/elevi');
        if (response.ok) {
          const data = await response.json();
          setElevi(data);
        }
      } catch (error:any) {
        console.error('Error fetching elevi:', error.message);
      }
    };

    fetchElevi();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newElev = {
      nume: formData.get('nume'),
      batalion: formData.get('batalion'),
      marime_pantof: parseInt(formData.get('marime_pantof') as string),
      dimensiune_uniforma: formData.get('dimensiune_uniforma'),
      varsta: parseInt(formData.get('varsta') as string),
      sex_elev: formData.get('sex_elev'),
    };

    try {
      const response = await fetch('/api/elevi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newElev),
      });

      if (response.ok) {
        const savedElev = await response.json();
        setElevi([...elevi, savedElev]);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error creating elev:', error);
    }
  };

  const handleElevClick = async (elev: Elev) => {
    setSelectedElev(elev);
    const { data, error } = await supabase
      .from('echipament')
      .select('*')
      .eq('elev_id', elev.id);
    if (error) console.error('Error fetching equipment:', error);
    else {
      setEquipments(data);
      setIsEquipmentModalOpen(true);
    }
  };

  const handleDeleteElev = async () => {
    if (elevToDelete !== null) {
      try {
        const response = await fetch(`/api/elevi/`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: elevToDelete }),
        });


        if (response.ok) {
          setElevi(elevi.filter((elev) => elev.id !== elevToDelete));
          setIsDeleteOpen(false);
        }
      } catch (error) {
        console.error('Error deleting elev:', error);
      }
    }
  };

  const handleDeleteEquipment = async (id: number) => {
    try {
      const response = await fetch(`/api/echipament/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEquipments(equipments.filter((equipment) => equipment.id !== id));
      }
    } catch (error) {
      console.error('Error deleting equipment:', error);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Dialog open={isEquipmentModalOpen} onOpenChange={setIsEquipmentModalOpen}>
        <DialogContent className='max-w-screen-lg'>
          <DialogHeader>
            <DialogTitle>Echipamente pentru {selectedElev?.nume}</DialogTitle>
          </DialogHeader>
          <table className="w-full">
            <thead>
              <tr>
                <th className='py-2 pr-12 text-center'>Tip</th>
                <th className='py-2 pr-12 text-center'>Denumire</th>
                <th className='py-2 pr-12 text-center'>Mărime</th>
                <th className='py-2 pr-12 text-center'>Data Atribuire</th>
                <th className='py-2 pr-12 text-center'>Sex</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {equipments.map((equipment) => (
                <tr className='pb-16' key={equipment.id}>
                  <td className='py-2 pr-12 text-center'>{equipment.tip}</td>
                  <td className='py-2 pr-12 text-center'>{equipment.denumire}</td>
                  <td className='py-2 pr-12 text-center'>{equipment.marime}</td>
                  <td className='py-2 pr-12 text-center'>{equipment.data_atribuire}</td>
                  <td className='py-2 pr-12 text-center'>{equipment.sex}</td>
                  <td className='py-2 pr-12 text-center'>
                    <Button onClick={() => handleDeleteEquipment(equipment.id)}>Șterge</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button onClick={() => setIsEquipmentModalOpen(false)}>Închide</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmare Ștergere</DialogTitle>
          </DialogHeader>
          <p>Sigur doriți să ștergeți acest elev?</p>
         <div className="flex justify-center gap-12">
         <Button className='bg-red-500 text-white hover:bg-red-700' onClick={handleDeleteElev}>Confirm</Button>
         <Button onClick={() => setIsDeleteOpen(false)}>Anulează</Button>
         </div>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lista Elevi</h1>
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Caută elev..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-md p-2"
          />
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>Adaugă Elev Nou</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adaugă Elev Nou</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="nume">Nume</Label>
                  <Input
                    type="text"
                    id="nume"
                    name="nume"
                    required
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="batalion">Batalion</Label>
                  <Input
                    type="text"
                    id="batalion"
                    name="batalion"
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="marime_pantof">Mărime Pantof</Label>
                  <Input
                    type="number"
                    id="marime_pantof"
                    name="marime_pantof"
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="dimensiune_uniforma">Dimensiune Uniformă</Label>
                  <Select name="dimensiune_uniforma">
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează mărimea" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XS">XS</SelectItem>
                      <SelectItem value="S">S</SelectItem>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="XL">XL</SelectItem>
                      <SelectItem value="XXL">XXL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="varsta">Vârstă</Label>
                  <Input
                    type="number"
                    id="varsta"
                    name="varsta"
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="sex_elev">Sex</Label>
                  <Select name="sex_elev">
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează sexul" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculin</SelectItem>
                      <SelectItem value="F">Feminin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  Salvează
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <table className="w-full">
        <thead>
          <tr>
            <th className='pr-12 text-center py-2'>Nume</th>
            <th className='pr-12 text-center py-2'>Batalion</th>
            <th className='pr-12 text-center py-2'>Mărime Pantof</th>
            <th className='pr-12 text-center py-2'>Dimensiune Uniformă</th>
            <th className='pr-12 text-center py-2'>Vârstă</th>
            <th className='pr-12 text-center py-2'>Sex</th>
            <th className='pr-12 text-center py-2'>Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {filteredElevi.map((elev) => (
            <tr key={elev.id} onClick={() => handleElevClick(elev)}>
              <td className='pr-12 text-center py-2'>{elev.nume}</td>
              <td className='pr-12 text-center py-2'>{elev.batalion}</td>
              <td className='pr-12 text-center py-2'>{elev.marime_pantof}</td>
              <td className='pr-12 text-center py-2'>{elev.dimensiune_uniforma}</td>
              <td className='pr-12 text-center py-2'>{elev.varsta}</td>
              <td className='pr-12 text-center py-2'>{elev.sex_elev}</td>
              <td className='pr-12 text-center py-2'>
                <Button onClick={() => { setElevToDelete(elev.id); setIsDeleteOpen(true); }}>Șterge</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}