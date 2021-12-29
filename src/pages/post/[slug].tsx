import {GetStaticProps, GetStaticPaths } from 'next'
import Primisc from '@prismicio/client'
import {RichText} from 'prismic-dom'
import {FiCalendar, FiUser} from 'react-icons/fi'

import { GetPrimiscClient } from '../../services/primisc'
import styles from './styles.module.scss'

interface PostProps {
    post:{
        slug: string;
        title: string;
        image: string;
        updatedAt: string;
        autor: string;
        content: string;
    }
}


export default function Post ({post}: PostProps){

    return(
        <main className={styles.container}>
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
                
        </main>
    )
}


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

    console.log( response.data.image )

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
            post
        },revalidate: 60 * 60 * 24 // 1dia
    }

}