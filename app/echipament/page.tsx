'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/utils/supabase';

interface Equipment {
  id: number;
  elev_id: number | null;
  tip: string;
  denumire: string;
  marime: string;
  data_atribuire: string;
  sex: string;
}

interface Elev {
  id: number;
  nume: string;
  batalion: string;
}

export default function EquipmentPage() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [elevi, setElevi] = useState<Elev[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEquipmentDeleteOpen, setIsEquipmentDeleteOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<number | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [equipmentType, setEquipmentType] = useState('');
  const [size, setSize] = useState('');

  const filteredEquipments = equipments.filter((equipment) => {
    return (
      equipment.denumire.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.tip.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  useEffect(() => {
    const fetchEquipments = async () => {
      const { data, error } = await supabase.from('echipament').select('*');
      if (error) console.error('Error fetching equipments:', error);
      else setEquipments(data);
    };

    const fetchElevi = async () => {
      const { data, error } = await supabase.from('elev').select('id, nume, batalion');
      if (error) console.error('Error fetching elevi:', error);
      else setElevi(data);
    };

    fetchEquipments();
    fetchElevi();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newEquipment = {
      elev_id: formData.get('elev_id') ? parseInt(formData.get('elev_id') as string) : null,
      tip: formData.get('tip'),
      denumire: formData.get('denumire'),
      marime: size ? size : formData.get('marime'),
      data_atribuire: formData.get('data_atribuire') || null,
      sex: formData.get('sex'),
    };

    const { data, error } = await supabase.from('echipament').insert([newEquipment]).select('*');
    console.log(data);
    if (error) console.error('Error creating equipment:', error);
    else {
      setEquipments([...equipments, ...data]);
      setIsOpen(false);
    }
  };

  const handleDeleteEquipment = async () => {
    if (equipmentToDelete !== null) {
      try {
        const response = await fetch('/api/echipament', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: equipmentToDelete }),
        });

        if (response.ok) {
          setEquipments(equipments.filter((equipment) => equipment.id !== equipmentToDelete));
          setIsEquipmentDeleteOpen(false);
        }
      } catch (error) {
        console.error('Error deleting equipment:', error);
      }
    }
  };

  const handleAssignClick = async (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsAssignModalOpen(true);
    
  };

  const handleEquipmentTypeChange = (value: string) => {
    setEquipmentType(value);
    value !== "uniforma" && setSize("");
  };

  const handleAssignEquipment = async (elevId: number) => {
    if (selectedEquipment) {
      const { error } = await supabase
        .from('echipament')
        .update({ elev_id: elevId, data_atribuire: new Date().toISOString().split('T')[0] })
        .eq('id', selectedEquipment.id);

      if (error) console.error('Error assigning equipment:', error);
      else {
        setEquipments(equipments.map((eq) => (
          eq.id === selectedEquipment.id ? { ...eq, elev_id: elevId, data_atribuire: new Date().toISOString().split('T')[0] } : eq
        )));
        setIsAssignModalOpen(false);
      }
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuie Echipament</DialogTitle>
          </DialogHeader>
          <Select onValueChange={handleAssignEquipment}>
            <SelectTrigger>
              <SelectValue placeholder="Selectează elevul" />
            </SelectTrigger>
            <SelectContent>
              {elevi.map((elev) => (
                <SelectItem key={elev.id} value={elev.id.toString()}>{elev.nume}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setIsAssignModalOpen(false)}>Închide</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isEquipmentDeleteOpen} onOpenChange={setIsEquipmentDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmare Ștergere</DialogTitle>
          </DialogHeader>
          <p>Sigur doriți să ștergeți acest echipament?</p>
          <div className="flex justify-center gap-2">
            <Button className='bg-red-500 hover:bg-red-600' onClick={handleDeleteEquipment}>Confirm</Button>
            <Button onClick={() => setIsEquipmentDeleteOpen(false)}>Anulează</Button>
          </div>
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
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="elev_id">Elev</Label>
                  <Select name="elev_id">
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează elevul" />
                    </SelectTrigger>
                    <SelectContent>
                      {elevi.map((elev) => (
                        <SelectItem key={elev.id} value={elev.id.toString()}>
                          {elev.nume} - {elev.batalion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="tip">Tip</Label>
                  <Select onValueChange={(value) => handleEquipmentTypeChange(value)} name="tip">
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează tipul" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="arma">Arma</SelectItem>
                      <SelectItem value="uniforma">Uniforma</SelectItem>
                      <SelectItem value="incaltaminte">Încălțăminte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="denumire">Denumire</Label>
                  <Input type="text" id="denumire" name="denumire" required />
                </div>
                {
                  equipmentType === "uniforma" && (
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="dimensiune_uniforma">Dimensiune Uniformă</Label>
                      <Select onValueChange={value => setSize(value)} name="dimensiune_uniforma">
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
                  )
                }
                {
                  equipmentType === "incaltaminte" && (
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="marime_pantof">Mărima Pantof</Label>
                      <Input
                        type="number"
                        id="marime_pantof"
                        name="marime_pantof"
                      />
                    </div>
                  )
                }
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="data_atribuire">Data Atribuire</Label>
                  <Input type="date" id="data_atribuire" name="data_atribuire" />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="sex">Sex</Label>
                  <Select name="sex">
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează sexul" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculin</SelectItem>
                      <SelectItem value="F">Feminin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">Salvează</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <table className="w-full">
        <thead>
          <tr>
            <th className='pr-12 py-2 text-center'>Tip</th>
            <th className='pr-12 py-2 text-center'>Denumire</th>
            <th className='pr-12 py-2 text-center'>Mărime</th>
            <th className='pr-12 py-2 text-center'>Data Atribuire</th>
            <th className='pr-12 py-2 text-center'>Sex</th>
            <th className='pr-12 py-2 text-center'>Elev</th>
            <th className='pr-12 py-2 text-center'>Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {filteredEquipments.map((equipment) => (
            <tr key={equipment.id}>
              <td className='pr-12 py-2 text-center'>{equipment.tip}</td>
              <td className='pr-12 py-2 text-center'>{equipment.denumire}</td>
              <td className='pr-12 py-2 text-center'>{equipment.marime}</td>
              <td className='pr-12 py-2 text-center'>{equipment.data_atribuire}</td>
              <td className='pr-12 py-2 text-center'>{equipment.sex}</td>
              <td className='pr-12 py-2 text-center'>{equipment.elev_id ? elevi.find(elev => elev.id === equipment.elev_id)?.nume : 'N/A'}</td>
              <td>
                <div className="flex gap-4">
                  <Button onClick={() => handleAssignClick(equipment)}>Atribuie</Button>
                  <Button className='bg-red-500 hover:bg-red-600' onClick={() => { setEquipmentToDelete(equipment.id); setIsEquipmentDeleteOpen(true); }}>Șterge</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
