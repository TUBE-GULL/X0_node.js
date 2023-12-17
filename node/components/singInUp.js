import bcrypt from 'bcrypt';
import tokenGeneration from './function/tokenGeneration.js';
import readFileData from './function/readFileData.js';
import writeFileData from './function/writeFileData.js';

const userData = await readFileData()

const checkDoubleUserName = (formData) => {
   return userData.some(el => el.name == formData.name);
}

const checkDoubleUserNamePassword = async (formData) => {
   const user = userData.find(el => el.name === formData.name);
   if (user && await bcrypt.compare(formData.password, user.password)) {
      return true;
   }
   return false;
}

const singUp = async (req, res) => {
   const formData = req.body

   if (!checkDoubleUserName(formData)) {
      const hashedPassword = await bcrypt.hash(formData.password, 10);
      const newUser = {
         name: formData.name,
         password: hashedPassword,
         token: await tokenGeneration(15),
         time: "0:00",
      };

      userData.push(newUser);

      await writeFileData(userData);
      res.json({ success: true });//отправляет ответ клиенту ! 
   } else {
      console.log('Неудачная регистрация');
      res.status(401).json({ success: false, error: 'данный пользователь занят' });
   }
}

const singIn = async (req, res) => {
   const formData = req.body

   if (await checkDoubleUserNamePassword(formData)) {
      console.log('Successful authentication');
      userData.forEach(el => {
         if (el.name == formData.name) {
            req.session.user = {
               name: el.name,
               token: el.token,
               time: el.time,
            };
         }
      });
      res.json({ success: true })
   } else {
      console.log('Неудачная аутентификация')
      res.status(401).json({ success: false, error: 'Неверный логин или пароль' })
   }
}

export { singUp, singIn };
