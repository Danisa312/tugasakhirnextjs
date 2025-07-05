// components/Content.tsx
import React from 'react';
import { Container, Text } from '@nextui-org/react';

export function Content() {
  return (
    <Container css={{ textAlign: 'center', padding: '2rem' }}>
      <Text h1 size={30}>
        Selamat Datang ke Sistem Keuangan
      </Text>
    </Container>
  );
}