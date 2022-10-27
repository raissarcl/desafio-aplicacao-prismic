import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { formatarData } from '../../lib/datefns';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';


import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {

  const { isFallback } = useRouter();

  const totalWords = (() => {
    const words = post.data.content.reduce((acc, cur) => {
      acc += cur.heading;
      acc += RichText.asText(cur.body);
      return acc;
    }, '');

    const wordsLength = words.split(' ').length;

    const wordsPerMinute = `${Math.ceil(wordsLength / 200)} min`;

    return wordsPerMinute;
  })();

  if (isFallback) {
    return (
      <p>Carregando...</p>
    );
  }

  return (
    <main>
      <section className={`${commonStyles.section}, ${styles.post}`}>
        <header>
          <h1>{post.data.title}</h1>
          <div className={styles.info}>
            <span>{post.data.banner.url}</span>
            <span> <FiCalendar /> {formatarData(new Date(post.first_publication_date))}</span>
            <span><FiUser />{post.data.author}</span>
            <span><FiClock />{
              totalWords
            }</span>
          </div>
        </header>

        <div key={post.uid}>
          {post.data.content.map(words => {
            return (
              <>
                <h2>{words.heading}</h2>
                <p key={post.uid}>{RichText.asText(words.body)}</p>
              </>
            )
          })}
        </div>
      </section>

    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');
  const paths = posts.results.map(post => {
    return {
      params: { slug: `${post.uid}` }
    }
  });

  return {
    paths: paths,
    fallback: 'blocking'
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug));

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url ?? '',
      },
      author: response.data.author,
      content: response.data.content
    }
  }

  return {
    props: {
      post
    }
  }
}
