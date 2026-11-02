int longestSubstring(string s){
    
    unordered_map<char,int> freq;
    int left=0,res=0;
    
    while(int right=0;right<s.size();right++){
        if (freq.count(s[right] && freq[s[right]]>=left)){
            left=freq[s[right]]+1;
        }
        
        freq[s[right]]++;
        
        res=max(res,right-left+1);
    }
    return res;
}

int main(){
    string s;
    cin>>s;
    cout<<longestSubstring(s);
}
//abcabcbb