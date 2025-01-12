'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/utils/supabase';

interface Echipament {
  id: number;
  tip: string;
  denumire: string;
  marime: string;
  data_atribuire: string;
  sex: string;
  elev_id: number | null;
}

export default function EquipmentPage() {
  const [equipments, setEquipments] = useState<Echipament[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<number | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [equipmentToAssign, setEquipmentToAssign] = useState<number | null>(null);
  const [elevi, setElevi] = useState([]);

  useEffect(() => {
    const fetchEquipments = async () => {
      const { data, error } = await supabase.from('echipament').select('*');
      if (error) console.error('Error fetching equipments:', error);
      else setEquipments(data);
    };

    const fetchElevi = async () => {
      const { data, error } = await supabase.from('elev').select('*');
      if (error) console.error('Error fetching elevi:', error);
      else setElevi(data);
    };

    fetchEquipments();
    fetchElevi();
  }, []);

  const handleDeleteEquipment = async () => {
    if (equipmentToDelete !== null) {
      try {
        const response = await fetch(`/api/echipament/${equipmentToDelete}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setEquipments(equipments.filter((equipment) => equipment.id !== equipmentToDelete));
          setIsDeleteOpen(false);
        }
      } catch (error) {
        console.error('Error deleting equipment:', error);
      }
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmare Ștergere</DialogTitle>
          </DialogHeader>
          <p>Sigur doriți să ștergeți acest echipament?</p>
          <Button onClick={handleDeleteEquipment}>Confirm</Button>
          <Button onClick={() => setIsDeleteOpen(false)}>Anulează</Button>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lista Echipament</h1>
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Caută echipament..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-md p-2"
          />
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>Adaugă Echipament Nou</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adaugă Echipament Nou</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {{ ... }}
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <table className="w-full">
        <thead>
          <tr>
            <th>Tip</th>
            <th>Denumire</th>
            <th>Mărime</th>
            <th>Data Atribuire</th>
            <th>Sex</th>
            <th>Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {equipments.map((equipment) => (
            <tr key={equipment.id}>
              <td>{equipment.tip}</td>
              <td>{equipment.denumire}</td>
              <td>{equipment.marime}</td>
              <td>{equipment.data_atribuire}</td>
              <td>{equipment.sex}</td>
              <td>
                <Button onClick={() => { setEquipmentToDelete(equipment.id); setIsDeleteOpen(true); }}>Șterge</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
