import { Table, Button } from '@nextui-org/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Pendapatan } from '../../types/pendapatan';
import { axiosInstance } from '../../utils/axiosInstance';
import { useRouter } from 'next/router';

export default function PendapatanList() {
  const [data, setData] = useState<Pendapatan[]>([]);
  const router = useRouter()

  const fetchData = async () => {
    const res = await axiosInstance.get('/pendapatan');
    setData(res.data.data);
  };

  const handleDelete = async (id: number) => {
    await axiosInstance.delete(`/pendapatan/${id}`);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <h3>Daftar Pendapatan</h3>
      <Button onClick={() => router.push("/pendapatan/add")}>+ Tambah</Button>
      <Table>
        <Table.Header>
          <Table.Column>Tanggal</Table.Column>
          <Table.Column>Sumber</Table.Column>
          <Table.Column>Jumlah</Table.Column>
          <Table.Column>Aksi</Table.Column>
        </Table.Header>
        <Table.Body>
          {data.map((item) => (
            <Table.Row key={item.id}>
              <Table.Cell>{item.tanggal}</Table.Cell>
              <Table.Cell>{item.sumber}</Table.Cell>
              <Table.Cell>{item.jumlah}</Table.Cell>
              <Table.Cell>
                {/* <Link href={`/pendapatan/${item.id}`}><Button size="sm">Detail</Button></Link> */}
                <Button size="sm" css={{marginBottom: "5px"}} onClick={() => router.push(`/pendapatan/edit/${item.id}`)}>Edit</Button>
                <Button color="error" size="sm" onClick={() => handleDelete(item.id)}>Hapus</Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </>
  );
}
