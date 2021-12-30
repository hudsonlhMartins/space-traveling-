import Link from 'next/link'
import styles from './styles.module.scss'


export default function Header (){
    return(
        <header className={styles.conatiner}>
            <Link href='/'>
                <div>
                    <img src="/image/Logo.svg "/>
                </div>
            </Link>

        </header>
    )
}