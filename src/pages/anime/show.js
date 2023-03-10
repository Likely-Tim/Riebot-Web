import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { setCookie } from 'cookies-next';
import MongoDb from '../../utils/mongo_db';
import styles from '../../styles/anime/show.module.css';
import AnimeShowBody from '../../components/anime_show_body';
import { Dropdown, Button, Spacer } from '@nextui-org/react';

function UserSelect({ users, selected, setSelected, sort, setSort }) {
  const userChoices = [{ key: 'Airing', name: 'Airing' }].concat(users);
  let userSelectionDisabled = false;
  if (userChoices.length < 2) {
    userSelectionDisabled = true;
  }
  const userKeyMap = new Map();
  for (const userChoice of userChoices) {
    userKeyMap.set(String(userChoice.key), userChoice.name);
  }

  function checkSortDisabled(user) {
    if (user === 'Airing') {
      return true;
    } else {
      return false;
    }
  }

  return (
    <div className={styles.selectionContainer}>
      <Dropdown isDisabled={userSelectionDisabled}>
        <Dropdown.Button disabled={userSelectionDisabled}>{userKeyMap.get(getSetFirstValue(selected))}</Dropdown.Button>
        <Dropdown.Menu
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={selected}
          disabledKeys={selected}
          onSelectionChange={setSelected}
          items={userChoices}
        >
          {(item) => <Dropdown.Item key={item.key}>{item.name}</Dropdown.Item>}
        </Dropdown.Menu>
      </Dropdown>
      <Spacer></Spacer>
      <Dropdown isDisabled={checkSortDisabled(getSetFirstValue(selected))}>
        <Dropdown.Button disabled={checkSortDisabled(getSetFirstValue(selected))}>
          {getSetFirstValue(sort)}
        </Dropdown.Button>
        <Dropdown.Menu
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={sort}
          disabledKeys={sort}
          onSelectionChange={setSort}
        >
          <Dropdown.Item key={'Day'}>Day</Dropdown.Item>
          <Dropdown.Item key={'Time'}>Time</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <Spacer></Spacer>
      <Link href="/api/auth/anilist">
        <Button auto>Add User</Button>
      </Link>
    </div>
  );
}

export default function Home({ users }) {
  const [selected, setSelected] = React.useState(new Set(['Airing']));
  const [sort, setSort] = React.useState(new Set(['Day']));

  setCookie('redirect', '/anime/show');

  return (
    <div className={styles.pageContainer}>
      <Head>
        <title>Riebot</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <UserSelect
        users={users}
        selected={selected}
        setSelected={setSelected}
        sort={sort}
        setSort={setSort}
      ></UserSelect>
      <AnimeShowBody selectedUser={getSetFirstValue(selected)} sort={getSetFirstValue(sort)}></AnimeShowBody>
    </div>
  );
}

export async function getServerSideProps() {
  const users = await MongoDb.getAllAnilistUsers();
  for (const user of users) {
    Object.defineProperty(user, 'key', Object.getOwnPropertyDescriptor(user, '_id'));
    delete user['_id'];
  }
  return { props: { users: users } };
}

function getSetFirstValue(set) {
  return set.values().next().value;
}
