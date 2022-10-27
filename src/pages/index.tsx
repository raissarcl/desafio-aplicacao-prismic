import { GetStaticProps } from 'next';
import { formatarData } from '../lib/datefns';

import { getPrismicClient } from '../services/prismic';

import { FiCalendar, FiUser } from 'react-icons/fi';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Link from 'next/link';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState<string>(postsPagination.next_page);

  async function handleMorePosts(e: any) {
    e.preventDefault();

    if (!nextPage) return;

    const result = await fetch(nextPage).then(result => result);
    const newPosts = await fetch(result.url).then(response => response.json());

    const cleanPosts = newPosts.results.map((post: Post) => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        }
      }
    });

    setPosts(state => [...state, ...cleanPosts]);
    setNextPage(newPosts.next_page);
  }

  return (
    <section className={commonStyles.section}>
      {posts.map(post => {
        return (
          <div key={post.uid} className={styles.post} >
            <Link href={`/post/${post.uid}`}>
              <a>
                <h1>{post.data.title}</h1>
              </a>
            </Link>
            <p>{post.data.subtitle}</p>
            <div className={styles.detalhes}>
              <span className={styles.calendario}> <FiCalendar /><time>{formatarData(new Date(post.first_publication_date))}</time></span>
              <span className={styles.autor}> <FiUser /> {post.data.author}</span>
            </div>
          </div>
        )
      })}
      {nextPage && <button className={styles.carregar} onClick={handleMorePosts}>Carregar mais posts</button>}
    </section>

  );

}

export const getStaticProps: GetStaticProps = async (query) => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
    pageSize: 1,
  });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  }

  return {
    props: {
      postsPagination
    }
  }
};
