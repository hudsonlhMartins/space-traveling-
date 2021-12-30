import {GetStaticProps, GetStaticPaths } from 'next'
import Primisc from '@prismicio/client'
import {RichText} from 'prismic-dom'
import {FiCalendar, FiUser} from 'react-icons/fi'

import { GetPrimiscClient } from '../../services/primisc'
import styles from './styles.module.scss'
import Link from 'next/link'
import { useEffect } from 'react'

type PostProps = {
    
    slug: string;
    title: string;
    image: string;
    updatedAt: string;
    autor: string;
    content: string;
    
}

type NextPrev = {
    uid: string;
    title: string;
}


interface SlugProps {
    post: PostProps;
    nextPostFormated: NextPrev[];
    prevPostFormated: NextPrev[];
}


export default function Post ({post, nextPostFormated, prevPostFormated }: SlugProps){


    useEffect(()=>{
        let scriptEl = document.createElement("script");
        scriptEl.setAttribute("src", "https://utteranc.es/client.js")
        scriptEl.setAttribute("crossorigin", "anonymous")
        scriptEl.setAttribute("async", "true")
        scriptEl.setAttribute("repo", "hudsonlhMartins/space-traveling-")
        scriptEl.setAttribute("theme", "github-dark")
        scriptEl.setAttribute("issue-term", "pathname")
        const commentBox = document.querySelector('.commentBox')
        commentBox.appendChild(scriptEl)
    },[])



    return(
        <main className={styles.container}>
            <div className={styles.container_content}>

                <div className={styles.banner}>
                    <img src={post.image} />
                </div>

                <div className={styles.content_title}>

                    <h1>{post.title}</h1>
                    <div>
                        <span>
                            <FiCalendar size={18}/>
                            {post.updatedAt}
                        </span>

                        <span>
                            <FiUser size={18}/>
                            {post.autor}
                        </span>
                    </div>
                </div>

                <div className={styles.acticle} dangerouslySetInnerHTML={{__html: post.content}} />
            </div>
            
            
            <div className={styles.line}></div>



                
            <div className={styles.buttons_next_prev}>

                {prevPostFormated &&(
                    <Link href={`/post/${prevPostFormated[0].uid}`}>
                        <a >
                            <strong>{prevPostFormated[0].title}...</strong>
                            <i>Post anterios</i>
                        </a>
                    </Link>
                )}

                
              {console.log(nextPostFormated)}

              {nextPostFormated&&(
                <Link href={ `/post/${nextPostFormated[0].uid}`}>
                    <a className={styles.a_last}>
                        <strong>{nextPostFormated[0].title}...</strong>
                        <i className={styles.last_i}>Proximo post</i>
                    </a>
                </Link>
                )}

               
            </div>



                <div className="commentBox"></div>

        </main>
    )
}




/*


            <div className={styles.buttons_next_prev}>
                {prevPostFormated !== [] &&(
                <Link href={prevPostFormated ? `/post/${prevPostFormated[0].uid}`: '/'}>
                    <a>
                        <strong>{prevPostFormated[0].title}...</strong>
                        <i>Post anterios</i>
                    </a>
                </Link>
                )}

                {nextPostFormated&&(
                <Link href={ nextPostFormated ?`/post/${nextPostFormated[0].uid}`: '/'}>
                    <a>
                        <strong>{nextPostFormated[0].title}...</strong>
                        <i className={styles.last_i}>Proximo post</i>
                    </a>
                </Link>
                )}
              

               
            </div>




*/









export const getStaticPaths: GetStaticPaths = ()=>{
    return{
        paths: [],
        fallback: 'blocking',
    }
} 


export const getStaticProps: GetStaticProps = async ({params}) => {

    const {slug} = params

    const prismic = GetPrimiscClient()

    const response = await prismic.getByUID('post', String(slug), {})

    const nextPost = await prismic.query(
        [Primisc.predicates.at('document.type', 'post')],
        {
          orderings: '[document.first_publication_date]',
          after: response.id,
          pageSize: 1,
        }
      ) 

    const prevPost = await prismic.query(
        [Primisc.predicates.at('document.type', 'post')],
        {
          orderings: '[document.first_publication_date desc]',
          after: response.id,
          pageSize: 1,
        }
    )

    const nextPostFormated = nextPost.results.map(post =>{
        return{
            uid: post.uid,
            title: RichText.asText(post.data.title).slice(0, 22),
        }
    })

  
    const prevPostFormated = prevPost.results.map(post =>{
        
        return {
            uid: post.uid,
            title: RichText.asText(post.data.title).slice(0, 26) ,
        }
    })
    

    const post = {
        slug: response.uid,
        title: RichText.asText(response.data.title),
        content: RichText.asHtml(response.data.content),
        updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }),
        autor: RichText.asText(response.data.autor),
        image: response.data.image.url ,
    }

    return{
        props:{
            post,
            nextPostFormated: nextPost.results_size > 0 ? nextPostFormated : null ,
            prevPostFormated: prevPost.results_size > 0 ? prevPostFormated : null,
        },revalidate: 60 * 60 * 24 // 1dia
    }

}