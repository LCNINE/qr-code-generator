import Service from "../service";

type SignUpProb = {
  email: string;
  password: string;
};

type InsertMemberProb = {
  userId: string;
  email: string;
};

type SignInProb = {
  email: string;
  password: string;
};

class MemberService extends Service {
  async signUpUser({ email, password }: SignUpProb) {
    const supabase = await this.supabase;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  }

  async insertMember({ userId, email }: InsertMemberProb) {
    const supabase = await this.supabase;
    const { error } = await supabase.from('members').insert({
      id: userId,
      email: email,
    });
    return error;
  }

  async signInUser({ email, password }: SignInProb) {
    const supabase = await this.supabase;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if(error) {
      return error
    }else return data
  }
}

export default MemberService;
