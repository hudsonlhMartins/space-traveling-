import {GetStaticProps} from 'next'
import {GetPrimiscClient} from '../services/primisc'

import Primisc from '@prismicio/client'
import {RichText} from 'prismic-dom'
import { format, compareAsc } from 'date-fns'
import {FiCalendar, FiUser} from 'react-icons/fi'


import styles from './home.module.scss'
import Link from 'next/link'
import { useState } from 'react'


type Post ={
  slug: string;
  title: string;
  execerpt: string;
  autor: string;
  updateAd: string;
}

interface PostsPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps{
  postsPagination: PostsPagination
}

export default function Home({postsPagination }: HomeProps) {
  const {next_page, results} = postsPagination


  const [posts, setPosts] = useState(results)
  const [nextPage, setNextPage] = useState(next_page)
  const [showButton, setShowButton] = useState(false)



  const getMorePost = async () :Promise<void> =>  {

    if(!nextPage){
      setShowButton(true)
      return
    }
    setShowButton(false)

    const nextPosts = await fetch(next_page)
    const nextPostsJson = nextPosts.json()

    const datas = nextPostsJson.then(res =>{

      const formatedPostsMore = res.results.map(item=>{
        return{
            slug: item.uid,
            title: RichText.asText(item.data.title),
            execerpt: item.data.content.find(content => content.type === 'paragraph')?.text ?? '',
            autor: RichText.asText(item.data.autor),
            updateAd: new Date(item.first_publication_date).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            }) ,
        }
      })

      setPosts([...posts, ...formatedPostsMore])



      nextPostsJson.then(res => setNextPage(res.next_page))
    })
    
  }

 




  return (
    <main className={styles.container}>
      {posts.map(post =>(
              <section key={post.slug} className={styles.content}>
                <Link href={`./post/${post.slug}`}>
                  <a>{post.title}</a>
                </Link>
                
                <p>{post.execerpt}</p>
                <div className={styles.content_autor_date}>
                  <div>
                    <p><FiCalendar size={18}/></p>
                    
                    <p>{post.updateAd}</p>
                  </div>
                  <div>
                    <p><FiUser size={18} /></p>
                    <p>{post.autor}</p>
                  </div>
                </div>
              </section>
      ))}

        <div className={styles.buttonNext}>
          <span className={showButton ? styles.disabled : styles.active } onClick={()=>  getMorePost()} >Carregar mais posts</span>
        </div>

    </main>
  )
}


export const getStaticProps: GetStaticProps = async ()=>{


  const prismic = GetPrimiscClient()

  const response = await prismic.query(
    [Primisc.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.content', 'post.autor'],
      pageSize: 5,
    }
  )  


  // response.next_page | prev_page
  const dataFomart = response.results.map(item =>{
    return{
      slug: item.uid,
      title: RichText.asText(item.data.title),
      execerpt: item.data.content.find(content => content.type === 'paragraph')?.text ?? '',
      autor: RichText.asText(item.data.autor),
      updateAd: new Date(item.first_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }) ,
    }
  })


  const finalProps = {
    next_page: response.next_page,
    results: dataFomart,
  }


  return{
    props:{
      postsPagination: finalProps,
    },  // 1hr
  }
}